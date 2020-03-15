import {Game} from './game.js';
import {difficulties} from "./difficulty.js";

export class Page {
    constructor() {
        this.html = document.querySelector('html');
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
        this.html.addEventListener('mousedown', () => Page.mouseDown = true);
        this.html.addEventListener('mouseup', () => Page.mouseDown = false);
    }

    prepReset() {
        Page.resetButton.addEventListener('mousedown', () => Page.resetButton.setAttribute('src', '/images/faces/face_pressed.svg'));
        Page.resetButton.addEventListener('mouseup', () => Page.resetButton.setAttribute('src', Page.currentFace));
        Page.resetButton.addEventListener('mouseleave', () => Page.resetButton.setAttribute('src', Page.currentFace));

        Page.resetButton.addEventListener('click', () => {
            clearInterval(this.game.timer);
            this.timerElement.textContent = '0';
            this.startNewGame();
            Page.currentFace = '/images/faces/face_unpressed.svg';
            Page.resetButton.setAttribute('src', Page.currentFace);
        });
    }

    prepDifficultyButtons() {
        document.querySelector('#beginner')
            .addEventListener('click', () => {
                this.difficulty = difficulties.beginner;
                this.startNewGame();
            });

        document.querySelector('#intermediate')
            .addEventListener('click', () => {
                this.difficulty = difficulties.intermediate;
                this.startNewGame();
        });

        document.querySelector('#expert')
            .addEventListener('click', () => {
                this.difficulty = difficulties.expert;
                this.startNewGame();
            });
    }

    startNewGame() {
        this.game = new Game(this.difficulty.sizeX, this.difficulty.sizeY, this.difficulty.mines);
    }
}

Page.currentFace = '/images/faces/face_unpressed.svg';
Page.resetButton = document.querySelector('#reset');
Page.mouseDown = false;