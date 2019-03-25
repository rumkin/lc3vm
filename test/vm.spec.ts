import * as assert from 'assert';

import { Vm, Regs, Traps, Instructions as Ins} from "../src";

const {R0, R1, R2, R3} = Regs;

export default ({describe, it}) => {
    describe('VM', () => {
        describe('ADD', () => {
            it('Should add registers', () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Ins.add(R0, R0, -3),
                    Ins.add(R1, R1, 2),
                    Ins.addReg(R2, R1, R0),
                    Ins.trap(Traps.Halt),
                ]);
    
                const {reg, status} = vm.run(program);
    
                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R0], -3, 'R0 is -3');
                assert.equal(reg[R1], 2, 'R1 is 2');
                assert.equal(reg[R2], -1, 'R2 is -1');
            });
        });

        describe('STR', () => {
            it('Should write values to memory', () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Ins.add(R0, R0, 1),
                    Ins.add(R1, R0, 1),
                    Ins.str(R1, R0, 0),
                    Ins.trap(Traps.Halt),
                ]);
    
                const {reg, memory, status} = vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R0], 1, 'R0 is 1');
                assert.equal(reg[R1], 2, 'R1 is 2');
                assert.equal(memory[1], 2, 'mem[1] is 2');
            });
        })
    });
};