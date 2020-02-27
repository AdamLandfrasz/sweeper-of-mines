export class Cell {
    gameCell;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = "0";
        this.isClicked = false;
        this.isFlagged = false;
    }

    setImage() {
        const image = this.gameCell.firstElementChild;
        if (this.isFlagged) {
            image.setAttribute('src', `/images/tiles/flagged.png`);
            return;
        }
        if (!this.isClicked) {
            image.setAttribute('src', `/images/tiles/face-down.png`);
            return;
        }
        image.setAttribute('src', `/images/tiles/${this.type}.png`);
    }

    highlightImage() {
        const image = this.gameCell.firstElementChild;
        image.setAttribute('src', `/images/tiles/0.png`)
    }
}