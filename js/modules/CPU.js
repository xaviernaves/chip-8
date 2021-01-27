import { Keyboard, Renderer, Speaker } from "./index.js";

export class CPU {
    /**
     * 
     * @param {Renderer} renderer 
     * @param {Keyboard} keyboard 
     * @param {Speaker} speaker 
     */
    constructor(renderer, keyboard, speaker) {
        //Load modules
        this.renderer = renderer;
        this.keyboard = keyboard;
        this.speaker = speaker;
        this.reset();
    }

    reset() {
        //Memory, 4KB
        this.memory = new Uint8Array(4096);

        //16 byte registers
        this.reg = new Uint8Array(16);

        //Address pointer
        this.i = 0;

        //Timers
        this.delayTimer = 0;
        this.soundTimer = 0;

        //Program Counter stores the executing address
        this.pc = 0x200;

        this.opcode = 0;

        this.stack = new Array();
        this.paused = false;
        this.speed = 10;

        this.renderer.clear();
    }

    loadSprites() {
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, //0
            0x20, 0x60, 0x20, 0x20, 0x70, //1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, //2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, //3
            0x90, 0x90, 0xF0, 0x10, 0x10, //4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, //5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, //6
            0xF0, 0x10, 0x20, 0x40, 0x40, //7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, //8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, //9
            0xF0, 0x90, 0xF0, 0x90, 0x90, //A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, //B
            0xF0, 0x80, 0x80, 0x80, 0xF0, //C
            0xE0, 0x90, 0x90, 0x90, 0xE0, //D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, //E
            0xF0, 0x80, 0xF0, 0x80, 0x80  //F
        ]

        sprites.forEach((sprite, i) => this.memory[i] = sprite)
    }

    loadProgram(program) {
        for (let loc = 0; loc < program.length; loc++) {
            this.memory[0x200 + loc] = program[loc];
        }
        this.paused = false;
    }

    loadROM(name) {
        this.paused = true;
        let request = new XMLHttpRequest();
        const self = this;

        request.onload = () => {
            if (request.response) {
                let program = new Uint8Array(request.response);
                self.loadProgram(program);
            }
        }

        request.open("GET", `./roms/${name}`);
        request.responseType = 'arraybuffer'
        request.send();
    }

    cycle() {
        for (let i = 0; i < this.speed; i++) {
            if (!this.paused) {
                this.fetch();
                this.RUN();
            }
        }

        if (!this.paused) this.updateTimers()
        this.playSound();
        this.renderer.render();
    }

    updateTimers() {
        if (this.delayTimer > 0) this.delayTimer -= 1;
        if (this.soundTimer > 0) this.soundTimer -= 1;
    }

    playSound() {
        if (this.soundTimer > 0) this.speaker.play(440)
        else this.speaker.stop()
    }

    fetch() {
        this.opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
    }
}