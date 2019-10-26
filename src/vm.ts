import Error3 from 'error3'

export enum Regs {
    R0 = 0,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    PC, // Program counter
    COND, // Condition register
    COUNT,
}

class Registry {
    [Regs.R0]: number = 0;
    [Regs.R1]: number = 0;
    [Regs.R2]: number = 0;
    [Regs.R3]: number = 0;
    [Regs.R4]: number = 0;
    [Regs.R5]: number = 0;
    [Regs.R6]: number = 0;
    [Regs.R7]: number = 0;
    [Regs.PC]: number = 0;
    [Regs.COND]: number = 0;
    [Regs.COUNT]: number = 0;
};

export enum Compare {
    Zero = 1 << 0,
    Neg = 1 << 1,
    Pos = 1 << 2,
}

export enum Ops {
    BR = 0, // branch
    ADD,    // add
    LD,     // load
    ST,     // store
    JSR,    // jump register
    AND,    // bitwise and
    LDR,    // load register
    STR,    // store register
    RTI,    // - (unused)
    NOT,    // bitwise not
    LDI,    // load indirect
    STI,    // store indirect
    JMP,    // jump
    RES,    // reserved (unused)
    LEA,    // load effective address
    TRAP,   // Execute trap
}

export enum Traps {
    GETC = 0x20,
    OUT = 0x21,
    PUTS = 0x22,
    IN = 0x23,
    PUTSP = 0x24,
    HALT = 0x25,
}

export const INPUT_PREFIX = 'Enter a character: '

export abstract class VmError<T,E> extends Error3<T,E> {};

export class BadOpcodeErr extends VmError<{opcode: number}, void> {
    code = 'bad_opcode'

    format({opcode}) {
        return `Bad opcode ${toBinStr(opcode, 8)}`;
    }
}

export class BadTrapErr extends VmError<{trap: number}, void> {
    code = 'bad_trap'

    format({trap}) {
        return `Bad trap ${toBinStr(trap, 8)}`;
    }
}

type RunResult = {
    memory: Int16Array,
    reg: Registry,
    error: BadOpcodeErr|BadTrapErr,
    status: Boolean,
    output: Array<number>,
};

// Program counter start offset
const PC_START = 0x3000;

type OnFlush = (Uint8Array) => void
interface VmOptions {
    onFlush?: OnFlush
    memorySize?: number,
}

interface RunOptions {
    memory?: Int16Array
    input?:Array<number>
}

export class Vm {
    isRunning: boolean = false;
    memory?: Int16Array;
    memorySize: number; // Default memory size
    initialMemory: Int16Array | null = null;
    reg: Registry|null;
    _output: Array<number>;
    _buffer: Array<number>;
    _input: Array<number>;
    onFlush: OnFlush;
    _resolveInput: Function;

    constructor({
        onFlush = () => {},
        memorySize = 2**16,
    }:VmOptions = {}) {
        this.onFlush = onFlush;
        this.memorySize = memorySize;
    }

    async getc(): Promise<number> {
        if (this._input.length) {
            return Promise.resolve(
                this._input.shift()
            )
        }
        else {
            return new Promise((resolve) => {
                this._resolveInput = resolve
            })
        }
    }

    putc(char: number): void {
        this._buffer.push(char);
    }

    print(string: string): void {
        this._buffer.push(
            ...Array.from(string).map((c) => c.charCodeAt(0))
        )
    }

    flush(): void {
        this._output.push(...this._buffer);
        this.onFlush(
            Uint8Array.from(this._buffer)
        );
        this._buffer = [];
    }

    inputChar(char:number): void {
        if (this._resolveInput) {
            this._resolveInput(char)
        }
        else {
            this._input.push(char)
        }
    }

    memWrite(addr: number, value: number) {
        this.memory[addr] = value;
    }

    memRead(addr: number): number {
        return this.memory[addr];
    }

    updateFlags(r:number) {
        let flag: Compare;

        if (this.reg[r] > 0) {
            flag = Compare.Pos;
        }
        else if (this.reg[r] === 0) {
            flag = Compare.Zero;
        }
        else {
            flag = Compare.Neg;
        }

        this.reg[Regs.COND] = flag;
    }

    step(): Promise<boolean>|boolean {
        if (! this.isRunning) {
            throw new Error('not running');
        }

        const pc = this.reg[Regs.PC]++;
        const instr = toUint16(this.memory[pc]);
        const opcode = instr >> 12;

        switch (opcode) {
            case Ops.ADD:
            {
                const r0 = (instr >> 9) & 0b111;
                const r1 = (instr >> 6) & 0b111;
                const isImm = (instr >> 5) & 0b1;
                if (isImm) {
                    const val = signExtend(instr & 0x1F, 5);
                    this.reg[r0] = this.reg[r1] + val;
                }
                else {
                    const r2 = instr & 0b111;
                    this.reg[r0] = this.reg[r1] + this.reg[r2];
                }
                this.updateFlags(r0);
                break;
            }
            case Ops.AND: {
                const r0 = (instr >> 9) & 0b111;
                const r1 = (instr >> 6) & 0b111;
                const isImm = (instr >> 5) & 0b1;
                if (isImm) {
                    const val = signExtend(instr & 0x1F, 5);
                    this.reg[r0] = this.reg[r1] & val;
                }
                else {
                    const r2 = instr & 0b111;
                    this.reg[r0] = this.reg[r1] & this.reg[r2];
                }
                this.updateFlags(r0);
                break;
            }
            case Ops.NOT: {
                const r0 = (instr >> 9) & 0b111;
                const r1 = (instr >> 6) & 0b111;

                this.reg[r0] = ~this.reg[r1];
                this.updateFlags(this.reg[r0]);
                break;
            }
            case Ops.BR: {
                const pcOffset = signExtend(instr & 0b111111111, 9);
                const condFlag = (instr >>> 9) & 0b111;

                if (condFlag & this.reg[Regs.COND]) {
                    this.reg[Regs.PC] += pcOffset;
                }
                break;
            }
            case Ops.JMP: {
                const r0 = (instr >> 6) & 0b111;
                this.reg[Regs.PC] = this.reg[r0];
                break;
            }
            case Ops.JSR: {
                const r0 = (instr >> 6) & 0b111;
                const longFlag = (instr >> 11) & 0b1;
                const longPcOffset = signExtend(instr & 0x7ff, 11);

                this.reg[Regs.R7] = this.reg[Regs.PC];
                if (longFlag) {
                    this.reg[Regs.PC] += longPcOffset;
                }
                else {
                    this.reg[Regs.PC] = this.reg[r0];
                }
                break;
            }
            case Ops.LD: {
                const r0 = (instr >> 9) & 0b111;
                const pcOffset = signExtend(instr & 0x1ff, 9);

                this.reg[r0] = this.memory[this.reg[Regs.PC] + pcOffset];
                this.updateFlags(r0);
                break;
            }
            case Ops.LDI: {
                const r0 = (instr >> 9) & 0b111;
                const pcOffset = signExtend(instr & 0x1ff, 9);

                this.reg[r0] = this.memory[
                    this.memory[this.reg[Regs.PC] + pcOffset]
                ];
                this.updateFlags(r0);
                break;
            }
            case Ops.LDR: {
                const r0 = (instr >> 9) & 0b111;
                const r1 = (instr >> 6) & 0b111;
                const pcOffset = signExtend(instr & 0x3f, 6);

                this.reg[r0] = this.memory[
                    this.memory[this.reg[r1] + pcOffset]
                ];
                this.updateFlags(r0);
                break;
            }
            case Ops.LEA: {
                const r0 = (instr >> 9) & 0b111;
                const pcOffset = signExtend(instr & 0x1ff, 9);

                this.reg[r0] = this.reg[Regs.PC] + pcOffset;
                this.updateFlags(r0);
                break;
            }
            case Ops.ST: {
                const r0 = (instr >> 9) & 0b111;
                const pcOffset = signExtend(instr & 0x1ff, 9);

                this.memWrite(this.reg[Regs.PC] + pcOffset, this.reg[r0]);
                break;
            }
            case Ops.STI: {
                const r0 = (instr >> 9) & 0b111;
                const pcOffset = signExtend(instr & 0x1FF, 9);

                this.memWrite(
                    this.memRead(this.reg[Regs.PC] + pcOffset),
                    this.reg[r0],
                );

                break;
            }
            case Ops.STR: {
                const r0 = (instr >> 9) & 0b111;
                const r1 = (instr >> 6) & 0b111;
                const pcOffset = signExtend(instr & 0x3f, 6);

                this.memWrite(
                    this.reg[r1] + pcOffset,
                    this.reg[r0]
                );
                break;
            }
            case Ops.TRAP: {
                const trap = instr & 0xff;
                switch (trap) {
                    case Traps.GETC: {
                        return this.getc()
                        .then((char) => {
                            this.reg[Regs.R0] = char
                            return true
                        })
                    }
                    case Traps.OUT: {
                        this.putc(this.reg[Regs.R0])
                        this.flush();

                        return true;
                    }
                    case Traps.PUTS: {
                        let c = this.reg[Regs.R0];
                        let char;
                        while ((char = this.memory[c]) > 0) {
                            this.putc(char % 256);
                            c++
                        }
                        this.flush();
                        return true;
                    }
                    case Traps.IN: {
                        this.print(INPUT_PREFIX)
                        this.flush()
                        return this.getc()
                        .then((char) => {
                            this.reg[Regs.R0] = char
                            this.putc(char)
                            return true
                        })
                    }
                    case Traps.PUTSP: {
                        let c = this.reg[Regs.R0];
                        let char;
                        while ((char = this.memory[c]) > 0) {
                            const ui16 = toUint16(char)
                            this.putc(ui16 & 0xFF);
                            const char2 = ui16 >> 8;
                            if (char2 > 0) {
                                this.putc(char2);
                            }
                            c++
                        }
                        this.flush();
                        return true;
                    }
                    case Traps.HALT: {
                        this.flush();
                        return false;
                    }
                    default: {
                        throw new BadTrapErr({trap});
                    }
                }
            }
            case Ops.RES:
            case Ops.RTI:
            default:
                throw new BadOpcodeErr({opcode});
        }

        return true;
    }

    start(program: Uint16Array) {
        if (this.isRunning) {
            throw new Error('VM is running');
        }

        this.reset();
        this.isRunning = true;
        this.memory.set(program, PC_START);
    }

    stop(reset:Boolean = true) {
        if (! this.isRunning) {
            throw new Error('Not running');
        }

        this.isRunning = false;
    }

    reset() {
        this.memory = new Int16Array(
            this.memorySize
        );
        this._output = [];
        this._buffer = [];
        this._input = [];

        if (this.initialMemory !== null) {
            this.memory.set(this.initialMemory, 0);
        }

        this.reg = new Registry();
        this.reg[Regs.PC] = PC_START;
    }

    async run(program: Uint16Array, {
        memory: initialMemory = new Int16Array(),
        input = [],
    }: RunOptions = {}): Promise<RunResult> {
        this.start(program);
        this.memory.set(initialMemory.slice(0, 2999), 0);
        this._input = input;

        let running = true;
        let error = null;
        try {
            while (running && this.reg[Regs.PC] < this.memory.length) {
                running = await this.step();
            }
        }
        catch (err) {
            if (err instanceof VmError === false) {
                throw err;
            }
            else {
                error = err;
            }
        }

        const {memory, reg, _output: output} = this;

        this.stop();

        return {
            status: error === null,
            error,
            memory,
            reg,
            output,
        };
    }
}

function signExtend(bytes: number, bits: number): number {
    const max = 1 << (bits - 1);
    if (bytes < max) {
        return bytes;
    }
    else {
        return bytes - (1 << bits);
    }
}

function toBinStr(v: number, length: number): string {
    return v.toString(2).padStart(length, '0');
}

function toUint16(value: number): number {
    if (value > 0) {
        return value;
    }
    else {
        return 2**16 + value;
    }
}
