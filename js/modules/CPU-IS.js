/**
 * @type {CPU}
 */
import _cpu from "../chip8.js"
import { CPU } from "./CPU.js";

(() => {
    CPU.prototype.INSTRUCTIONS = {
        0x0000: function () {
            const codes = {
                0x00E0: function () { _cpu.renderer.clear() },
                0x00EE: function () { _cpu.pc = _cpu.stack.pop() }
            }

            return codes[_cpu.opcode]();
        },
        0x1000: function () { _cpu.pc = (_cpu.opcode & 0xFFF) },
        0x2000: function () {
            _cpu.stack.push(_cpu.pc);
            _cpu.pc = (_cpu.opcode & 0xFFF);
        },
        0x3000: function (x) { if (_cpu.reg[x] === (_cpu.opcode & 0xFF)) _cpu.pc += 2 },
        0x4000: function (x) { if (_cpu.reg[x] !== (_cpu.opcode & 0xFF)) _cpu.pc += 2 },
        0x5000: function (x, y) { if (_cpu.reg[x] === _cpu.reg[y]) _cpu.pc += 2 },
        0x6000: function (x) { _cpu.reg[x] = (_cpu.opcode & 0xFF) },
        0x7000: function (x) { _cpu.reg[x] += (_cpu.opcode & 0xFF) },
        0x8000: function (x, y) {
            const codes = {
                0x0: function (x, y) { _cpu.reg[x] = _cpu.reg[y] },
                0x1: function (x, y) { _cpu.reg[x] |= _cpu.reg[y] },
                0x2: function (x, y) { _cpu.reg[x] &= _cpu.reg[y] },
                0x3: function (x, y) { _cpu.reg[x] ^= _cpu.reg[y] },
                0x4: function (x, y) {
                    let sum = (_cpu.reg[x] += _cpu.reg[y]);

                    if (sum > 0xFF) _cpu.reg[0xF] = 1;
                    else _cpu.reg[0xF] = 0;

                    _cpu.reg[x] = sum;
                },
                0x5: function (x, y) {
                    if (_cpu.reg[x] > _cpu.reg[y]) _cpu.reg[0xF] = 1;
                    else _cpu.reg[0xF] = 0;

                    _cpu.reg[x] -= _cpu.reg[y];
                },
                0x6: function (x) {
                    _cpu.reg[0xF] = (_cpu.reg[x] & 0x1);
                    _cpu.reg[x] >>= 1;
                },
                0x7: function (x, y) {
                    if (_cpu.reg[y] > _cpu.reg[x]) _cpu.reg[0xF] = 1;
                    else _cpu.reg[0xF] = 0;

                    _cpu.reg[x] = _cpu.reg[y] - _cpu.reg[x];
                },
                0xE: function (x, y) {
                    _cpu.reg[0xF] = (_cpu.reg[x] & 0x80);
                    _cpu.reg[x] <<= 1;
                }
            }
            return codes[_cpu.opcode & 0xF](x, y);
        },
        0x9000: function (x, y) { if (_cpu.reg[x] !== _cpu.reg[y]) _cpu.pc += 2 },
        0xA000: function () { _cpu.i = (_cpu.opcode & 0xFFF) },
        0xB000: function () { _cpu.pc = (_cpu.opcode & 0xFFF) + _cpu.reg[0] },
        0xC000: function (x) {
            const rand = Math.floor(Math.random() * 0xFF);
            _cpu.reg[x] = rand & (_cpu.opcode & 0xFF);
        },
        0xD000: function (x, y) {
            const width = 8;
            const height = (_cpu.opcode & 0xF);

            _cpu.reg[0xF] = 0;

            for (let row = 0; row < height; row++) {
                let sprite = _cpu.memory[_cpu.i + row];

                for (let col = 0; col < width; col++) {
                    if ((sprite & 0x80) > 0) {
                        if (_cpu.renderer.setPixel(_cpu.reg[x] + col, _cpu.reg[y] + row)) {
                            _cpu.reg[0xF] = 1;
                        }
                    }
                    sprite <<= 1;
                }
            }
        },
        0xE000: function (x) {
            const codes = {
                0x9E: function (x) { if (_cpu.keyboard.isKeyPressed(_cpu.reg[x])) _cpu.pc += 2 },
                0xA1: function (x) { if (!_cpu.keyboard.isKeyPressed(_cpu.reg[x])) _cpu.pc += 2 }
            }
            return codes[_cpu.opcode & 0xFF](x);
        },
        0xF000: function (x) {
            const codes = {
                0x07: function (x) { _cpu.reg[x] = _cpu.delayTimer },
                0x0A: function (x) {
                    _cpu.paused = true;
                    _cpu.keyboard.onNextKeyPress = function (key) {
                        _cpu.reg[x] = key;
                        _cpu.paused = false;
                    }.bind(_cpu);
                },
                0x15: function (x) { _cpu.delayTimer = _cpu.reg[x] },
                0x18: function (x) { _cpu.soundTimer = _cpu.reg[x] },
                0x1E: function (x) { _cpu.i += _cpu.reg[x] }, // This bitch
                0x29: function (x) { _cpu.i = _cpu.reg[x] * 5 },
                0x33: function (x) {
                    _cpu.memory[_cpu.i] = parseInt(_cpu.reg[x] / 100);
                    _cpu.memory[_cpu.i + 1] = parseInt((_cpu.reg[x] % 100) / 10);
                    _cpu.memory[_cpu.i + 2] = parseInt(_cpu.reg[x] % 10);
                },
                0x55: function (x) {
                    for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
                        _cpu.memory[_cpu.i + registerIndex] = _cpu.reg[registerIndex];
                    }
                },
                0x65: function (x) {
                    for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
                        _cpu.reg[registerIndex] = _cpu.memory[_cpu.i + registerIndex];
                    }
                }
            }

            return codes[_cpu.opcode & 0xFF](x);
        }
    }

    CPU.prototype.RUN = function () {
        this.pc += 2;

        let x = (this.opcode & 0x0F00) >> 8;
        let y = (this.opcode & 0x00F0) >> 4;

        try {
            this.INSTRUCTIONS[this.opcode & 0xF000](x, y);
        } catch (error) {
            throw new Error(`Unknown opcode: 0x${this.opcode.toString(16)}`);
        }
    }
})()