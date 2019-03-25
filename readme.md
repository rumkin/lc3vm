# Little Computer 3 [WIP]

[Little Computer 3](https://en.wikipedia.org/wiki/LC-3) TypeScript implementation.

It contains VM to execute code and Instructions to write bytecode in JavaScript or TypeScript.

```javascript
import {Vm, Traps, Regs, Instructions as Ins} from './vm';

const {R0, R1, R2, R3} = Regs;

const program = Uint16Array.from([
    Ins.add(R0, R0, -3),
    Ins.add(R1, R1, -3),
    Ins.addReg(R2, R1, R0),
    Ins.str(R2, R3, 0),
    Ins.trap(Traps.Halt),
]);

const vm = new Vm();

const {status, reg, memory} = vm.run(program);
status; // -> true
reg[R2]; // -> -6
memory[0]; // -> -6
```

## Progress

Opcodes realized:

- [x] BR
- [x] ADD
- [x] LD
- [x] ST
- [x] JSR
- [x] AND
- [x] LDR
- [x] STR
- [ ] ~~RTI~~ (unused)
- [x] NOT
- [x] LDI
- [x] STI
- [x] JMP
- [ ] ~~RES~~ (unused)
- [x] LEA
- [ ] TRAP:
    - [ ] Getc
    - [ ] Out
    - [ ] Puts
    - [ ] In
    - [ ] Putsp
    - [x] Halt


## License

MIT © [Rumkin](https://rumk.in)