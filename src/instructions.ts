import {Ops, Regs, Traps} from './vm';

export function addReg(r1: Regs, r2: Regs, r3: Regs): number {
    return r3
        | r2 << 6
        | r1 << 9
        | Ops.ADD << 12;
}

export function add(r1: Regs, r2: Regs, val: number): number {
    return toInt5(val)
        | 1 << 5
        | r2 << 6
        | r1 << 9
        | Ops.ADD << 12;
}

export function jmp(r1: Regs): number {
    return (r1 & 7) << 6
        | Ops.JMP << 12;
}

export function jsr(r1: Regs): number {
    return (r1 & 7) << 6
        | Ops.JSR << 12;
}

export function jsrReg(offset: number): number {
    return 1 << 11
        | toInt11(offset)
        | Ops.JSR << 12;
}

export function trap(trap: Traps): number {
    return trap
        | Ops.TRAP << 12;
}

export function ld(r1: Regs, value: number): number {
    return (r1 & 7) << 9
        | toInt9(value)
        | Ops.LD << 12;

}

// Convert JS number to 2's compliment signed integer.
export function createInt(size: number): (value: number) => number {
    const maxValue = (1 << (size - 1)) - 1;
    const minValue = -maxValue - 1;

    return (value) => {
        if (value > maxValue || value < minValue) {
            throw new Error(`Int${size} overflow`);
        }

        if (value < 0) {
            return (1 << size) + value;
        }
        else {
            return value;
        }
    };
}

const toInt5 = createInt(5);
const toInt9 = createInt(9);
const toInt11 = createInt(11);
