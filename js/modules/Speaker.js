export class Speaker {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        /**
         * @type {AudioContext}
         */
        this.context = new AudioContext();

        this.gain = this.context.createGain();
        this.finish = this.context.destination;
        this.gain.connect(this.finish);
    }

    play(frequency) {
        if (this.context && !this.oscillator) {
            this.oscillator = this.context.createOscillator();

            this.oscillator.frequency.setValueAtTime(frequency || 440, this.context.currentTime);
            this.oscillator.type = "triangle";

            this.oscillator.connect(this.gain);
            this.oscillator.start();
        }

    }

    stop() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }
}