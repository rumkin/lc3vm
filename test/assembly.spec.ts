import * as assert from 'assert';

import * as Ins from '../src/assembly';
import {toBin, fmt} from './utils';

export default function({describe, it}) {
    describe('Assembly', () => {
        describe('jsr()', () => {
            it('(7)', () => {
                const result = toBin(Ins.jsr(7));
                const origin = fmt('0100 0 00 111 000000');

                assert.equal(result, origin);
            });
            it('(5)', () => {
                const result = toBin(Ins.jsr(5));
                const origin = fmt('0100 0 00 101 000000');

                assert.equal(result, origin);
            });
            it('(1)', () => {
                const result = toBin(Ins.jsr(1));
                const origin = fmt('0100 0 00 001 000000');

                assert.equal(result, origin);
            });
        });

        describe('jsrReg()', () => {
            it('(1)', () => {
                const result = toBin(Ins.jsrReg(1));
                const origin = fmt('0100 1 000 0000 0001');

                assert.equal(result, origin);
            });

            it('(1023)', () => {
                const result = toBin(Ins.jsrReg(1023));
                const origin = fmt('0100 1 011 1111 1111');

                assert.equal(result, origin);
            });

            it('(-1)', () => {
                const result = toBin(Ins.jsrReg(-1));
                const origin = fmt('0100 1 111 1111 1111');

                assert.equal(result, origin);
            });

            it('(-1024)', () => {
                const result = toBin(Ins.jsrReg(-1024));
                const origin = fmt('0100 1 100 0000 0000');

                assert.equal(result, origin);
            });
        });

        describe('ld()', () => {
            it('(1, 0)', () => {
                const result = toBin(Ins.ld(1, 0));
                const origin = fmt('0010 001 0 0000 0000');

                assert.equal(result, origin);
            });

            it('(1, 1)', () => {
                const result = toBin(Ins.ld(1, 1));
                const origin = fmt('0010 001 0 0000 0001');

                assert.equal(result, origin);
            });

            it('(1, 255)', () => {
                const result = toBin(Ins.ld(1, 255));
                const origin = fmt('0010 001 0 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -1)', () => {
                const result = toBin(Ins.ld(1, -1));
                const origin = fmt('0010 001 1 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -256)', () => {
                const result = toBin(Ins.ld(1, -256));
                const origin = fmt('0010 001 1 0000 0000');

                assert.equal(result, origin);
            });
        });

        describe('ldi()', () => {
            it('(1, 0)', () => {
                const result = toBin(Ins.ldi(1, 0));
                const origin = fmt('1010 001 0 0000 0000');

                assert.equal(result, origin);
            });

            it('(1, 1)', () => {
                const result = toBin(Ins.ldi(1, 1));
                const origin = fmt('1010 001 0 0000 0001');

                assert.equal(result, origin);
            });

            it('(1, 255)', () => {
                const result = toBin(Ins.ldi(1, 255));
                const origin = fmt('1010 001 0 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -1)', () => {
                const result = toBin(Ins.ldi(1, -1));
                const origin = fmt('1010 001 1 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -256)', () => {
                const result = toBin(Ins.ldi(1, -256));
                const origin = fmt('1010 001 1 0000 0000');

                assert.equal(result, origin);
            });
        });

        describe('ldr()', () => {
            it('(1, 1, 0)', () => {
                const result = toBin(Ins.ldr(1, 1, 0));
                const origin = fmt('0110 001 001 00 0000');

                assert.equal(result, origin);
            });

            it('(1, 1, 1)', () => {
                const result = toBin(Ins.ldr(1, 1, 1));
                const origin = fmt('0110 001 001 00 0001');

                assert.equal(result, origin);
            });

            it('(1, 1, 31)', () => {
                const result = toBin(Ins.ldr(1, 1, 31));
                const origin = fmt('0110 001 001 01 1111');

                assert.equal(result, origin);
            });

            it('(1, 1, -1)', () => {
                const result = toBin(Ins.ldr(1, 1, -1));
                const origin = fmt('0110 001 001 11 1111');

                assert.equal(result, origin);
            });

            it('(1, 1, -32)', () => {
                const result = toBin(Ins.ldr(1, 1, -32));
                const origin = fmt('0110 001 001 10 0000');

                assert.equal(result, origin);
            });
        });

        describe('lea()', () => {
            it('(1, 0)', () => {
                const result = toBin(Ins.lea(1, 0));
                const origin = fmt('1110 001 0 0000 0000');

                assert.equal(result, origin);
            });

            it('(1, 1)', () => {
                const result = toBin(Ins.lea(1, 1));
                const origin = fmt('1110 001 0 0000 0001');

                assert.equal(result, origin);
            });

            it('(1, 255)', () => {
                const result = toBin(Ins.lea(1, 255));
                const origin = fmt('1110 001 0 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -1)', () => {
                const result = toBin(Ins.lea(1, -1));
                const origin = fmt('1110 001 1 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -256)', () => {
                const result = toBin(Ins.lea(1, -256));
                const origin = fmt('1110 001 1 0000 0000');

                assert.equal(result, origin);
            });
        });

        describe('st()', () => {
            it('(1, 0)', () => {
                const result = toBin(Ins.st(1, 0));
                const origin = fmt('0011 001 0 0000 0000');

                assert.equal(result, origin);
            });

            it('(1, 1)', () => {
                const result = toBin(Ins.st(1, 1));
                const origin = fmt('0011 001 0 0000 0001');

                assert.equal(result, origin);
            });

            it('(1, 255)', () => {
                const result = toBin(Ins.st(1, 255));
                const origin = fmt('0011 001 0 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -1)', () => {
                const result = toBin(Ins.st(1, -1));
                const origin = fmt('0011 001 1 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -256)', () => {
                const result = toBin(Ins.st(1, -256));
                const origin = fmt('0011 001 1 0000 0000');

                assert.equal(result, origin);
            });
        });

        describe('sti()', () => {
            it('(1, 0)', () => {
                const result = toBin(Ins.sti(1, 0));
                const origin = fmt('1011 001 0 0000 0000');

                assert.equal(result, origin);
            });

            it('(1, 1)', () => {
                const result = toBin(Ins.sti(1, 1));
                const origin = fmt('1011 001 0 0000 0001');

                assert.equal(result, origin);
            });

            it('(1, 255)', () => {
                const result = toBin(Ins.sti(1, 255));
                const origin = fmt('1011 001 0 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -1)', () => {
                const result = toBin(Ins.sti(1, -1));
                const origin = fmt('1011 001 1 1111 1111');

                assert.equal(result, origin);
            });

            it('(1, -256)', () => {
                const result = toBin(Ins.sti(1, -256));
                const origin = fmt('1011 001 1 0000 0000');

                assert.equal(result, origin);
            });
        });

        describe('str()', () => {
            it('(1, 1, 0)', () => {
                const result = toBin(Ins.str(1, 1, 0));
                const origin = fmt('0111 001 001 000000');

                assert.equal(result, origin);
            });

            it('(1, 1, 1)', () => {
                const result = toBin(Ins.str(1, 1, 1));
                const origin = fmt('0111 001 001 000001');

                assert.equal(result, origin);
            });

            it('(1, 1, 31)', () => {
                const result = toBin(Ins.str(1, 1, 31));
                const origin = fmt('0111 001 001 011111');

                assert.equal(result, origin);
            });

            it('(1, 1, -1)', () => {
                const result = toBin(Ins.str(1, 1, -1));
                const origin = fmt('0111 001 001 111111');

                assert.equal(result, origin);
            });

            it('(1, 1, -32)', () => {
                const result = toBin(Ins.str(1, 1, -32));
                const origin = fmt('0111 001 001 100000');

                assert.equal(result, origin);
            });
        });
    });

    describe('Utils', () => {
        describe('createInt()', () => {
            it('should create proper int8 converter', () => {
                const int8 = Ins.createInt(8);

                assert.equal(int8(0), 0);
                assert.equal(int8(127), 0b01111111);
                assert.equal(int8(-1), 0b11111111);
                assert.equal(int8(-128), 0b10000000);
            });

            it('should create proper int5 converter', () => {
                const int8 = Ins.createInt(5);

                assert.equal(int8(0), 0);
                assert.equal(int8(15), 0b01111);
                assert.equal(int8(-1), 0b11111);
                assert.equal(int8(-16), 0b10000);
            });

            it('should create proper int2 converter', () => {
                const int8 = Ins.createInt(2);

                assert.equal(int8(0), 0);
                assert.equal(int8(1), 0b01);
                assert.equal(int8(-1), 0b11);
                assert.equal(int8(-2), 0b10);
            });
        });
    });
}
