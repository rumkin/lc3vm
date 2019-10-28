# Little Computer 3

[Little Computer 3](https://en.wikipedia.org/wiki/Little_Computer_3) TypeScript implementation.

It contains VM to execute code and Instructions to write bytecode in JavaScript or TypeScript.

## Install

```
npm i lc3vm
```

## Usage

Create a program using progmatic interface and run it into VM.

```javascript
import {Vm, Traps, Regs, Instructions as Ins} from './vm';

const {R0, R1, R2, R3} = Regs;

const program = Uint16Array.from([
    Ins.add(R0, R0, 2),
    Ins.add(R1, R1, 1),
    Ins.addReg(R2, R1, R0),
    Ins.str(R2, R3, 0),
    Ins.trap(Traps.OUT),
    Ins.trap(Traps.Halt),
]);

const vm = new Vm();

const {status, reg, memory, output} = await vm.run(program);
status; // -> true
reg[R2]; // -> 3
memory[0]; // -> 3
output; // -> [2]
```

# Test coverage

Opcodes tested:

- [ ] BR
- [x] ADD
- [x] AND
- [ ] JMP
- [ ] JSR
- [ ] LD
- [ ] LDI
- [ ] LDR
- [x] LEA
- [x] NOT
- [ ] ~~RTI~~ (unused)
- [ ] ~~RES~~ (unused)
- [x] ST
- [x] STR
- [ ] STI
- [x] TRAP:
    - [x] Getc
    - [x] Out
    - [x] Puts
    - [x] In
    - [x] Putsp
    - [x] Halt

## License

MIT © [Rumkin](https://rumk.in)
