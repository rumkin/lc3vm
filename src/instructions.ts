import {Ops, Traps} from './vm';

export function addReg(r1: number, r2: number, r3: number): number {
    return r3
        | r2 << 6
        | r1 << 9
        | Ops.ADD << 12;
}

export function add(r1: number, r2: number, val: number): number {
    return toInt5(val)
        | 1 << 5
        | r2 << 6
        | r1 << 9
        | Ops.ADD << 12;
}

export function jmp(r1: number): number {
    return (r1 & 7) << 6
        | Ops.JMP << 12;
}

export function jsr(r1: number): number {
    return (r1 & 7) << 6
        | Ops.JSR << 12;
}

export function jsrReg(offset: number): number {
    return 1 << 11
        | offset & 0xfff
        | Ops.JSR << 12;
}

export function trap(trap: Traps): number {
    return trap
        | Ops.TRAP << 12;
}

function toInt5(val: number): number {
    if (val > 15 || val < -16) {
        throw new Error('Int5 overflow');
    }

    return Math.abs(val) & 15 | (val < 0 ? 1 << 4 : 0);
}