import {Game} from './game.js';

export class Page {
    constructor() {
        this.html = document.querySelector('html');
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
        Page.resetButton.addEventListener('mousedown', () => Page.resetButton.setAttribute('src', '/images/faces/face_pressed.svg'));
        Page.resetButton.addEventListener('mouseup', () => Page.resetButton.setAttribute('src', Page.currentFace));
        Page.resetButton.addEventListener('mouseleave', () => Page.resetButton.setAttribute('src', Page.currentFace));
        // Page.resetButton.addEventListener('mouseenter', () => {
        //     if (Page.mouseDown) {
        //         Page.resetButton.setAttribute('src', '/images/faces/face_pressed.svg');
        //     }
        // });
        Page.resetButton.addEventListener('click', () => {
            clearInterval(this.game.timer);
            this.timerElement.textContent = '0';
            this.game = new Game(9, 9, 10);
            Page.currentFace = '/images/faces/face_unpressed.svg';
            Page.resetButton.setAttribute('src', Page.currentFace);
        });
    }
}
Page.currentFace = '/images/faces/face_unpressed.svg';
Page.resetButton = document.querySelector('#reset');
Page.mouseDown = false;