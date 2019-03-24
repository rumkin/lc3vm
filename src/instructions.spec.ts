import * as assert from 'assert';

import * as Ins from './instructions';

export default function({describe, it}) {
    describe('jsr()', () => {
        it('(7)', () => {
            const result = toBin(Ins.jsr(7));
            const origin = join('0100 0 00 111 000000');
            
            assert.equal(result, origin);
        });
        it('(5)', () => {
            const result = toBin(Ins.jsr(5));
            const origin = join('0100 0 00 101 000000');
            
            assert.equal(result, origin);
        });
        it('(1)', () => {
            const result = toBin(Ins.jsr(1));
            const origin = join('0100 0 00 001 000000');
            
            assert.equal(result, origin);
        });
    });
}

function toBin(value:number, length:number = 16): string {
    return `0b${value.toString(2).padStart(length, '0')}`;
}

function join(value:string): string {
    return `0b${value.replace(/\s/g, '').padEnd(16, '0')}`;
}