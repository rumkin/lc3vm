export type Instruction
  = AddIns
  | DivIns

class AddIns {}
class DivIns {}

export function parseBytecode(bytecode: Uint16Array): Array<Instruction> {
  const parsed = new Array(bytecode.length);
  return parsed;
}
