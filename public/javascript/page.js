import {Game} from './game.js';
import {difficulties} from "./difficulty.js";

export class Page {
    constructor() {
        this.mouseDown = false;
        this.html = document.querySelector('html');
        this.buttons = document.querySelectorAll('button');
        this.resetButton = document.querySelector('#reset');
        this.timerElement = document.querySelector('#timer');
        this.difficulty = difficulties.beginner;
        this.startNewGame();
        this.prepPage();
        this.prepDifficultyButtons();
        this.prepReset();
    }

    prepPage() {
        this.html.addEventListener('contextmenu', (e) => e.preventDefault());
        this.html.addEventListener('mousedown', (e) => e.preventDefault());
        this.html.addEventListener('mousedown', () => this.mouseDown = true);
        this.html.addEventListener('mouseup', () => this.mouseDown = false);
    }

    prepReset() {
        this.resetButton.addEventListener('click', () => {
            this.setFace('pressed');
            setTimeout(() => this.resetGameState(), 100);
        });
    }

    prepDifficultyButtons() {
        this.buttons.forEach(btn => btn.addEventListener('click', () => {
            this.resetButtons();
            btn.toggleAttribute('disabled');
            btn.classList.toggle('selected');
            this.difficulty = this.getDiff(btn.dataset.difficulty);
            this.resetGameState();
        }));
    }

    resetButtons() {
        this.buttons.forEach(btn => {
            if (btn.classList.contains('selected')) btn.classList.toggle('selected');
            if (btn.disabled) btn.toggleAttribute('disabled');
        });
    }

    getDiff(diff) {
        switch (diff) {
            case 'beginner':
                return difficulties.beginner;
            case 'intermediate':
                return difficulties.intermediate;
            case 'expert':
                return difficulties.expert;
        }
    }

    setFace(face = 'unpressed') {
        switch (face) {
            case 'pressed':
                this.resetButton.setAttribute('src', '/images/faces/face_pressed.svg');
                break;
            case 'win':
                this.resetButton.setAttribute('src', '/images/faces/face_win.svg');
                break;
            case 'lose':
                this.resetButton.setAttribute('src', '/images/faces/face_lose.svg');
                break;
            default:
                this.resetButton.setAttribute('src', '/images/faces/face_unpressed.svg');
        }
    }

    resetTimer() {
        clearInterval(this.game.timer);
        this.timerElement.textContent = '0';
    }

    startNewGame() {
        this.game = new Game(this.difficulty.sizeX, this.difficulty.sizeY, this.difficulty.mines, this);
    }

    resetGameState() {
        this.setFace();
        this.resetTimer();
        this.startNewGame();
    }
}