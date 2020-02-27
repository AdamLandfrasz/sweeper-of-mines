import { Game } from './game.js';
export class Page {
    static mouseDown = false;

    constructor() {
        this.html = document.querySelector('html');
        this.resetButton = document.querySelector('#reset');
        this.timerElement = document.querySelector('#timer');
        this.game = new Game(9, 9, 10);
        this.prepPage();
        this.prepReset();
    }

    prepPage() {
        this.html.addEventListener('contextmenu', (e) => e.preventDefault());
        this.html.addEventListener('mousedown', (e) => e.preventDefault());
        this.html.addEventListener('mousedown', () => Page.mouseDown = true);
        this.html.addEventListener('mouseup', () => Page.mouseDown = false);
    }

    prepReset() {
        this.resetButton.addEventListener('mousedown', () => this.resetButton.setAttribute('src', '/images/faces/face_pressed.svg'));
        this.resetButton.addEventListener('mouseup', () => this.resetButton.setAttribute('src', '/images/faces/face_unpressed.svg'));
        this.resetButton.addEventListener('mouseleave', () => this.resetButton.setAttribute('src', '/images/faces/face_unpressed.svg'));
        this.resetButton.addEventListener('mouseenter', () => {
            if (Page.mouseDown) {
                this.resetButton.setAttribute('src', '/images/faces/face_pressed.svg');
            }
        });
        this.resetButton.addEventListener('click', () => {
            clearInterval(this.game.timer);
            this.timerElement.textContent = '0';
            this.game = new Game(9, 9, 10);
        });
    }
}