import 'should';

import * as Ins from './instructions';

export default function({describe, it}) {
    describe('jsr()', () => {
        it('(7)', () => {
            const result = toBin(Ins.jsr(7));
            const origin = join('0100', '0',  '00', '111');
            
            result.should.be.equal(origin);
        });
        it('(5)', () => {
            const result = toBin(Ins.jsr(5));
            const origin = join('0100', '0',  '00','101');
            
            result.should.be.equal(origin);
        });
        it('(1)', () => {
            const result = toBin(Ins.jsr(1));
            const origin = join('0100', '0', '00', '001');
            
            result.should.be.equal(origin);
        });
    });
}

function toBin(value:number, length:number = 16): string {
    return `0b${value.toString(2).padStart(length, '0')}`;
}

function join(...args:string[]): string {
    return `0b${args.join('').padEnd(16, '0')}`;
}