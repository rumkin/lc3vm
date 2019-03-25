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

export function ldi(r1: Regs, value: number): number {
    return (r1 & 7) << 9
        | toInt9(value)
        | Ops.LDI << 12;

}

export function ldr(r1: Regs, r2: Regs, offset: number): number {
    return (r1 & 7) << 9
        | (r2 & 7) << 6
        | toInt6(offset)
        | Ops.LDR << 12;

}

export function lea(r1: Regs, value: number): number {
    return (r1 & 7) << 9
        | toInt9(value)
        | Ops.LEA << 12;
}

export function st(r1: Regs, value: number): number {
    return (r1 & 7) << 9
        | toInt9(value)
        | Ops.ST << 12;
}

export function sti(r1: Regs, offset: number): number {
    return (r1 & 7) << 9
        | toInt9(offset)
        | Ops.STI << 12;
}

export function str(r1: Regs, r2: Regs, offset: number): number {
    return (r1 & 7) << 9
        | (r2 & 7) << 6
        | toInt6(offset)
        | Ops.STR << 12;
}

// Convert JS number to 2's compliment signed integer.
export function createInt(size: number): (value: number) => number {
    if (size < 2) {
        throw new Error('Minimum size is 2');
    }
    else if (size > 64) {
        throw new Error('Maximum size is 64');
    }

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
const toInt6 = createInt(6);
const toInt9 = createInt(9);
const toInt11 = createInt(11);
