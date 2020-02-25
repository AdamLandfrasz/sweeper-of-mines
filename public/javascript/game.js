class GamePieceFactory {
    constructor() {
        this.parser = new DOMParser();
    }

    getGameRow() {
        return this.parser.parseFromString(`<div class="row"></div>`, "text/html").querySelector('div');
    }

    getGameCell() {
        return this.parser.parseFromString(`<div class="cell"><img src="" alt="cell-img" class="cell-img"></div>`, "text/html").querySelector('div');
    }
}

class Directions {
    static directions = [
        {x: 0, y: -1}, // north
        {x: 1, y: -1}, // northeast
        {x: 1, y: 0},  // east
        {x: 1, y: 1},  // southeast
        {x: 0, y: 1},  // south
        {x: -1, y: 1}, // southwest
        {x: -1, y: 0}, // west
        {x: -1, y: -1} // northwest
    ];
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = "0";
        this.isClicked = false;
        this.isFlagged = false;
    }
}

class Game {
    constructor(sizeX, sizeY, minesCount) {
        this.gamePieceFactory = new GamePieceFactory();

        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.minesCount = minesCount;
        this.isOver = false;

        this.board = [];
        for (let i = 0; i < sizeX; i++) {
            this.board.push([]);
            for (let j = 0; j < sizeY; j++) {
                this.board[i].push(new Cell(i, j));
            }
        }
        this.allCells = this.board.flat();
        this.randomizeMines();
        this.calculateValues();
        this.allMines = this.allCells.filter((cell) => cell.type === 'mine');
        this.refresh();
    }

    isCellOnBoard(x, y) {
        return x >= 0 && y >= 0 && x < this.sizeX && y < this.sizeY;
    }

    randomizeMines() {
        let mines = this.minesCount;
        while (mines > 0) {
            let randomIndex = Math.floor(Math.random() * this.allCells.length);
            if (this.allCells[randomIndex].type !== 'mine') {
                this.allCells[randomIndex].type = 'mine';
                mines--;
            }
        }
    }

    calculateValues() {
        for (let cell of this.allCells) {
            if (cell.type === 'mine') {
                continue;
            }
            let mineCount = 0;
            for (let direction of Directions.directions) {
                let nextX = cell.x + direction.x;
                let nextY = cell.y + direction.y;
                if (!this.isCellOnBoard(nextX, nextY)) {
                    continue;
                }
                if (this.board[nextX][nextY].type === 'mine') {
                    mineCount++;
                }
            }
            cell.type = mineCount.toString();
        }
    }

    prepGameCell(gameCell) {
        const cellX = gameCell.dataset.x;
        const cellY = gameCell.dataset.y;
        const cell = this.board[cellX][cellY];

        gameCell.addEventListener('click', () => {
            if (cell.isFlagged) {
                return;
            }
            if (cell.isClicked) {
                return;
            }
            if (cell.type === 'mine') {
                cell.type = 'mine-red';
                this.allMines.forEach((mine) => {
                    mine.isFlagged = false;
                    mine.isClicked = true;
                });
                this.isOver = true;
                this.refresh();
                return;
            }
            if (cell.type === '0') {
                cell.isClicked = true;
                this.revealNext(cell);
                this.refresh();
                return;
            }
            cell.isClicked = true;
            this.refresh();
        });

        gameCell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (cell.isClicked) {
                return;
            }
            if (cell.isFlagged) {
                cell.isFlagged = false;
                this.refresh();
                return;
            }
            cell.isFlagged = true;
            this.refresh();
        });
    }

    playerHasWon() {
        return this.allCells.length - this.allCells.filter((cell) => cell.type !== 'mine' && cell.isClicked).length === this.minesCount;
    }

    revealNext(cell) {
        for (let direction of Directions.directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;

            if (!this.isCellOnBoard(nextX, nextY)) {
                continue;
            }
            let nextCell = this.board[nextX][nextY];
            if (nextCell.type === 'mine') {
                continue;
            }
            if (nextCell.isClicked === false) {
                nextCell.isClicked = true;
                nextCell.isFlagged = false;
                if (nextCell.type === "0") {
                    this.revealNext(nextCell);
                }
            }
        }
    }

    refresh() {
        const container = document.querySelector('.container');
        container.innerHTML = '';
        if (this.playerHasWon()) {
            this.isOver = true;
        }
        for (let i = 0; i < this.sizeX; i++) {
            let gameRow = this.gamePieceFactory.getGameRow();
            for (let j = 0; j < this.sizeY; j++) {
                let cell = this.board[i][j];
                let gameCell = this.gamePieceFactory.getGameCell();

                let image = gameCell.firstElementChild;
                if (cell.isFlagged) {
                    image.setAttribute('src', `/images/flagged.png`);
                } else if (!cell.isClicked) {
                    image.setAttribute('src', `/images/face-down.png`);
                } else {
                    image.setAttribute('src', `/images/${cell.type}.png`);
                }

                // image.setAttribute('src', `/images/${cell.type}.png`);
                gameCell.dataset.x = cell.x.toString();
                gameCell.dataset.y = cell.y.toString();
                if (!this.isOver) {
                    this.prepGameCell(gameCell);
                }
                gameRow.appendChild(gameCell);
            }
            container.appendChild(gameRow);
        }
    }
}

new Game(9, 9, 10);