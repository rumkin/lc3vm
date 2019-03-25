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
    ST,     // store // NOT DONE
    JSR,    // jump register
    AND,    // bitwise and
    LDR,    // load register
    STR,    // store register // NOT DONE
    RTI,    // - (unused)
    NOT,    // bitwise not
    LDI,    // load indirect
    STI,    // store indirect // NOT DONE
    JMP,    // jump
    RES,    // reserved (unused) 
    LEA,    // load effective address // NOT DONE
    TRAP,   // Execute trap // NOT DONE
}

export enum Traps {
    Halt = 0x25,
}

// Program counter start offset
const PC_START = 0x3000;

export class Vm {
    isRunning: boolean = false;
    memory?: Int16Array;
    memorySize: number = 2 ** 16; // Default memory size
    initialMemory: Int16Array | null = null;
    reg: Registry|null;

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

    updateFlags(r:number) {
        let flag: Compare;

        if (this.reg[r] === 0) {
            flag = Compare.Zero;
        }
        else if (this.reg[r] > 0) {
            flag = Compare.Pos;
        }
        else {
            flag = Compare.Neg;
        }

        this.reg[Regs.COND] = flag;
    }

    step(): boolean {
        if (! this.isRunning) {
            throw new Error('not running');
        }

        const instr = toUint16(this.memory[this.reg[Regs.PC]++]);
        const op = instr >> 12;

        switch (op) {
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
                this.updateFlags(r0);
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

                switch (instr & 0xff) {
                    case Traps.Halt: {
                        return false;
                    }
                    default: {
                        throw new Error('Unknown trap');
                    }
                }
            }
            case Ops.RES:
            case Ops.RTI:
            default:
                throw new Error(`Bad opcode ${toBinStr(op, 4)}`);
        }

        return true;
    }

    memWrite(addr: number, value: number) {
        this.memory[addr] = value;
    }

    memRead(addr: number): number {
        return this.memory[addr];
    }

    reset() {
        this.memory = new Int16Array(
            new ArrayBuffer(this.memorySize)
        );

        if (this.initialMemory != null) {
            this.memory.set(this.initialMemory, 0);
        }

        this.reg = new Registry();
        this.reg[Regs.PC] = PC_START;
    }

    run(program: Uint16Array): {memory: Int16Array, reg: Registry} {
        this.start(program);

        let running = true;
        let limit = 1000;
        while(running && limit--) {
            running = this.step();
        }

        const {memory, reg} = this;

        this.stop();

        return {memory, reg};
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
