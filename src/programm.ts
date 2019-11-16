import {Instruction, parseBytecode} from './instructions';

export class Programm {
  private inst: Array<Instruction>;

  static from(byteCode) {
    return new this(parseBytecode(byteCode))
  }

  constructor (inst: Array<Instruction>) {
    this.inst = inst;
  }
}
