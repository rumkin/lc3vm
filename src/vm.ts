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

class Reg {
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
    LD,     // load // NOT DONE
    ST,     // store // NOT DONE
    JSR,    // jump register
    AND,    // bitwise and
    LDR,    // load register // NOT DONE
    STR,    // store register // NOT DONE
    RTI,    // - (unused)
    NOT,    // bitwise not
    LDI,    // load indirect // NOT DONE
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
    reg: Reg|null;
    private program: Uint16Array|null = null;

    loadProgram(program: Uint16Array): void {
        if (this.isRunning) {
            throw new Error('VM is running');
        }

        this.program = program;
    }

    start() {
        if (this.isRunning) {
            throw new Error('VM is running');
        }

        this.reset();
        this.isRunning = true;
        this.memory.set(this.program, PC_START);
    }

    stop(reset:Boolean = true) {
        if (! this.isRunning) {
            throw new Error('Not running');
        }
        
        this.isRunning = false;
        if (reset) {
            this.memory = null;
            this.reg = null;
        }
    }

    updatesFlag(r:number) {
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
                this.updatesFlag(r0);
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
                this.updatesFlag(r0);
                break;
            }
            case Ops.NOT: {
                const r0 = (instr >> 9) & 0b111;
                const r1 = (instr >> 6) & 0b111;

                this.reg[r0] = ~this.reg[r1];
                this.updatesFlag(r0);
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
                const r1 = (instr >> 6) & 0b111;
                this.reg[Regs.PC] = this.reg[r1];
                break;
            }
            case Ops.JSR: {
                const r1 = (instr >> 6) & 0b111;
                const longFlag = (instr >> 11) & 0b1;
                const longPcOffset = signExtend(instr & 0x7ff, 11);

                this.reg[Regs.R7] = this.reg[Regs.PC];
                if (longFlag) {
                    this.reg[Regs.PC] += longPcOffset;
                }
                else {
                    this.reg[Regs.PC] = this.reg[r1];
                }
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
            default:
                throw new Error(`Unknown opcode ${toBinStr(op, 4)}`);
        }

        return true;
    }

    reset() {
        this.memory = new Int16Array(
            new ArrayBuffer(this.memorySize)
        );

        if (this.initialMemory != null) {
            this.memory.set(this.initialMemory, 0);
        }

        this.reg = new Reg();
        this.reg[Regs.PC] = PC_START;
    }

    run(reset: Boolean = true) {
        this.start();

        let running = true;
        let limit = 1000;
        while(running && limit--) {
            running = this.step();
        }

        this.stop(reset);
    }
}

function signExtend(bytes: number, bits: number): number {
    const shift = (bits - 1);
    const value = bytes & ((1 << shift) - 1);  
    const sign = ((bytes >> shift) & 1) ? -1 : 1;

    return sign * value;
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
