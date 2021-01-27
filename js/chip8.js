import { CPU, Renderer, Keyboard, Speaker } from "./modules/index.js"

let renderer = new Renderer(10);
let keyboard = new Keyboard();
let speaker = new Speaker();
let cpu = new CPU(renderer, keyboard, speaker);

const gameSelection = document.querySelector("#games");
[
    "BLINKY", "BLITZ", "BRIX", "CONNECT4", "INVADERS", "PONG",
    "PONG (1 player)", "TETRIS", "TICTAC", "UFO", "WIPEOFF"
].map(title => {
    const option = document.createElement("option");
    option.value = title;
    option.textContent = title;
    gameSelection.append(option);
})

const fullscreen = () => {
    if (canvas.RequestFullScreen) {
        canvas.RequestFullScreen();
    } else if (canvas.webkitRequestFullScreen) {
        canvas.webkitRequestFullScreen();
    } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
    } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
    } else {
        alert("This browser doesn't supporter fullscreen");
    }
}
const canvas = document.querySelector('canvas');
canvas.addEventListener("dblclick", fullscreen);


let startTime, now, then, elapsed, loop;
const fps = 60, fpsInterval = 1000 / fps;
const init = (ROM) => {
    if (loop) cancelAnimationFrame(loop);

    cpu.reset();
    then = Date.now();
    startTime = then;

    cpu.loadSprites();
    if (ROM !== undefined) cpu.loadROM(ROM);
    else cpu.paused = true;
    loop = requestAnimationFrame(step);
}

const step = () => {
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) cpu.cycle();
    loop = requestAnimationFrame(step);
}

gameSelection.addEventListener("change", () => {
    init((gameSelection.value !== "Game selection") ? gameSelection.value : undefined)
    document.activeElement.blur();
})

export default cpu;