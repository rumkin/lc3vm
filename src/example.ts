import { Vm, Regs, Traps, Instructions as Ins} from "./";

const vm = new Vm();
const program = Uint16Array.from([
    Ins.add(0, 0, -3),
    Ins.add(1, 1, -3),
    Ins.addReg(2, 1, 0),
    Ins.trap(Traps.Halt),
]);
vm.setProgram(program);
vm.run(false);

function toBin(value:number):string {
    return value.toString(2).padStart(16, '0');
}

console.log('R0: %o', vm.reg[Regs.R0]);
console.log('R1: %o', vm.reg[Regs.R1]);
console.log('R2: %o', vm.reg[Regs.R2]);

console.log(toBin(Ins.jsrReg(1)));
console.log(toBin(Ins.jsrReg(4096)));
console.log(toBin(Ins.jsr(7)));