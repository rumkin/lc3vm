# Little Computer 3 [WIP]

[Little Computer 3](https://en.wikipedia.org/wiki/LC-3) TypeScript implementation.

It consists of two parts: VM which executes code and Instructions to write
low level byte commands in JavaScript or TypeScript.

```javascript
import {Vm, Traps, Instructions as Ins} from './vm';

const vm = new Vm();

const program = Uint16Array.from([
    Ins.add(0, 0, -3),
    Ins.add(1, 1, -3),
    Ins.addReg(2, 1, 0),
    Ins.trap(Traps.Halt),
]);

vm.loadProgram(program);
const {reg, memory} = vm.run();
// Do something with registers or memory.
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