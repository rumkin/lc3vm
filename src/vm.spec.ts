import * as assert from 'assert';

import { Vm, Regs, Traps, Instructions as Ins} from "./";

export default ({describe, it}) => {
    describe('VM', () => {
        it('Should run add programm', () => {
            const vm = new Vm();
            const program = Uint16Array.from([
                Ins.add(Regs.R0, Regs.R0, -3),
                Ins.add(Regs.R1, Regs.R1, 2),
                Ins.addReg(Regs.R2, Regs.R1, Regs.R0),
                Ins.trap(Traps.Halt),
            ]);
            vm.loadProgram(program);
            const {reg} = vm.run();

            assert.equal(reg[Regs.R0], -3, 'R0 is -3');
            assert.equal(reg[Regs.R1], 2, 'R1 is 2');
            assert.equal(reg[Regs.R2], -1, 'R2 is -1');
        });
    });
};