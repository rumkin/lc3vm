# Little Computer 3 VM

VM for [LC3](https://en.wikipedia.org/wiki/LC-3) education computer.

It consists of two parts: VM which executes code and Ops to write
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

vm.setProgram(program);
vm.run();
```

## License

MIT © [Rumkin](https://rumk.in)