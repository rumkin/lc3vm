import * as assert from 'assert';

import { Vm, Regs, Traps, Assembly as Asm} from "../src";

const {R0, R1, R2} = Regs;

function toUint8(char: string): number {
    return char.charCodeAt(0);
}

function toString(chars:number[]): string {
    return chars.map((char) => String.fromCharCode(char)).join('')
}

export default ({describe, it}) => {
    describe('VM', () => {
        describe('ADD', () => {
            it('Should add registers', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.add(R0, R0, -3),
                    Asm.add(R1, R1, 2),
                    Asm.addReg(R2, R1, R0),
                    Asm.trap(Traps.HALT),
                ]);

                const {reg, status} = await vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R0], -3, 'R0 is -3');
                assert.equal(reg[R1], 2, 'R1 is 2');
                assert.equal(reg[R2], -1, 'R2 is -1');
            });
        });

        describe('AND', () => {
            it('Should AND', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.add(R0, R0, 0b1101),
                    Asm.and(R1, R0, 0b0111),
                    Asm.trap(Traps.HALT),
                ]);

                const {reg, status} = await vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R1], 0b0101, 'R2 is 0b101');
            });

            it('Should AND registers', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.add(R0, R0, 0b1101),
                    Asm.add(R1, R1, 0b0111),
                    Asm.andReg(R2, R1, R0),
                    Asm.trap(Traps.HALT),
                ]);

                const {reg, status} = await vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R2], 0b0101, 'R2 is 0b101');
            });
        });

        describe('NOT', () => {
            it('Should NOT registers', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.add(R0, R0, 1),
                    Asm.not(R1, R0),
                    Asm.trap(Traps.HALT),
                ]);

                const {reg, status} = await vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R1], -2, 'R2 is 0b010');
            });
        });

        describe('ST', () => {
            it('Should write values to memory', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.add(R0, R0, 12),
                    Asm.st(R0, -10),
                    Asm.trap(Traps.HALT),
                ]);

                const {reg, memory, status} = await vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R0], 12, 'R0 is 12');
                assert.equal(memory[12280], 12, 'mem[1] is 12');
            });
        });

        describe('STR', () => {
            it('Should write values to memory', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.add(R0, R0, 1),
                    Asm.add(R1, R0, 1),
                    Asm.str(R1, R0, 0),
                    Asm.trap(Traps.HALT),
                ]);

                const {reg, memory, status} = await vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R0], 1, 'R0 is 1');
                assert.equal(reg[R1], 2, 'R1 is 2');
                assert.equal(memory[1], 2, 'mem[1] is 2');
            });
        });

        describe('TRAP.OUT', () => {
            it('Should output a char', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.add(R0, R0, 15),
                    Asm.add(R0, R0, 15),
                    Asm.add(R0, R0, 15),
                    Asm.add(R0, R0, 15),
                    Asm.add(R0, R0, 5),
                    Asm.trap(Traps.OUT),
                    Asm.trap(Traps.HALT),
                ]);

                const {status, output} = await vm.run(program);

                const char = String.fromCharCode(output[0])

                assert.equal(status, true, 'Status is true');
                assert.equal(char, 'A', 'Output is "A"');
            });
        });

        describe('TRAP.GETC', () => {
            it('Should read a char from input', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.trap(Traps.GETC),
                    Asm.trap(Traps.HALT),
                ]);

                const {status, reg} = await vm.run(program, {
                    input: [65],
                });

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R0], 65, 'Input is 65');
            });

            it('Should read a char from inputChar()', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.trap(Traps.GETC),
                    Asm.trap(Traps.HALT),
                ]);

                setImmediate(() => {
                    vm.inputChar(66)
                });
                const {status, reg} = await vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[R0], 66, 'Input is 66');
            });
        });

        describe('TRAP.IN', () => {
            it('Should output input message and a char', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.trap(Traps.IN),
                    Asm.trap(Traps.HALT),
                ]);

                const {status, output} = await vm.run(program, {
                    input: [65],
                });

                assert.equal(status, true, 'Status is true');
                assert.equal(toString(output), 'Enter a character: A', 'Input is 65');
            });
        });

        describe('TRAP.PUTS', () => {
            it('Should output a string', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.trap(Traps.GETC),
                    Asm.str(Regs.R0, Regs.R1, 0),
                    Asm.trap(Traps.GETC),
                    Asm.str(Regs.R0, Regs.R1, 1),
                    Asm.trap(Traps.GETC),
                    Asm.str(Regs.R0, Regs.R1, 2),
                    Asm.trap(Traps.GETC),
                    Asm.str(Regs.R0, Regs.R1, 3),
                    Asm.trap(Traps.GETC),
                    Asm.str(Regs.R0, Regs.R1, 4),
                    Asm.and(Regs.R0, Regs.R0, 0),
                    Asm.trap(Traps.PUTS),
                    Asm.trap(Traps.HALT),
                ]);

                const {status, output} = await vm.run(program, {
                    input: [72, 101, 108, 108, 111],
                });

                assert.equal(status, true, 'Status is true');
                assert.equal(toString(output), 'Hello', 'Input is "Hello"');
            });
        });

        describe('TRAP.PUTSP', () => {
            it('Should output a string', async () => {
                const vm = new Vm();
                const program = Uint16Array.from([
                    Asm.trap(Traps.PUTSP),
                    Asm.trap(Traps.HALT),
                ]);

                const {status, output} = await vm.run(program, {
                    memory: Int16Array.from([
                        28488, // 'o' 'H'
                        25965, // 'e' 'm'
                    ]),
                });

                assert.equal(status, true, 'Status is true');
                assert.equal(toString(output), 'Home', 'Input is "Home"');
            });
        });

        describe('TRAP.HALT', () => {
            it('Should not stop until the end', async () => {
                const vm = new Vm({
                    memorySize: 0x3001,
                });
                const program = Uint16Array.from([
                    Asm.add(R0, R0, 1),
                ]);

                const {status, reg} = await vm.run(program);

                assert.equal(status, true, 'Status is true');
                assert.equal(reg[Regs.PC], 0x3001, 'Program counter is 0x3001');
            });

            it('Should run till invalid opcode is meat', async () => {
                const vm = new Vm({
                    memorySize: 0x3002,
                });
                const program = Uint16Array.from([
                    Asm.add(R0, R0, 1),
                ]);

                const {status, error} = await vm.run(program);

                assert.equal(status, false, 'Status is false');
                assert.equal(error.code, 'bad_opcode', 'error.code is "bad_opcode"');
            });
        })
    });
};
