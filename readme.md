# Little Computer 3

[Little Computer 3](https://en.wikipedia.org/wiki/Little_Computer_3) TypeScript implementation.

It contains VM to execute code and Instructions to write bytecode in JavaScript or TypeScript.

## Install

```
npm i lc3vm
```

## Usage

Create a program using progmatic interface and run it into VM.

```js
import {Vm, Traps, Regs, Assembly as Asm} from './vm'

const {R0, R1, R2, R3} = Regs

const program = Uint16Array.from([
    Asm.add(R0, R0, 2),
    Asm.add(R1, R1, 1),
    Asm.addReg(R2, R1, R0),
    Asm.str(R2, R3, 0),
    Asm.trap(Traps.OUT),
    Asm.trap(Traps.Halt),
])

const vm = new Vm()

const {status, reg, memory, output} = await vm.run(program)
status // -> true
reg[R3] // -> 3
memory[0] // -> 3
output // -> [2]
```

### Run with predefined input

You can push an input into input buffer before VM is running. Here is the program
which outputs chars from input:

```js
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
])

const vm = new Vm()
const {status, output} = await vm.run(program, {
    input: [72, 101, 108, 108, 111], // Input 'Hello'
})
output // [72, 101, 108, 108, 111] or 'Hello'
```

## Test coverage

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
