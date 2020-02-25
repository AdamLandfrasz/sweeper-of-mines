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
        this.container = document.querySelector('.container');
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
        this.container.addEventListener('mousedown', (e) => e.preventDefault());

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
        this.allMines = this.allCells.filter((cell) => cell.type === 'mine');
        this.calculateValues();
        this.refresh();

        this.prepTimer();
    }

    isCellOnBoard(x, y) {
        return x >= 0 && y >= 0 && x < this.sizeX && y < this.sizeY;
    }

    hasPlayerWon() {
        return this.allCells.length - this.allCells.filter((cell) => cell.type !== 'mine' && cell.isClicked).length === this.minesCount;
    }

    countFlags() {
        return this.minesCount - this.allCells.filter((cell) => cell.isFlagged).length;
    }

    getCellElementByCoordinates(x, y) {
        return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
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

        gameCell.addEventListener('mousedown', () => {
            this.mouseDown = true;
            if (cell.isClicked) {
                this.highlightSurrounding(cell);
            }
        });
        gameCell.addEventListener('mouseup', () => {
            this.mouseDown = false;
            if (cell.isClicked) {
                this.refresh();
            }
        });
        gameCell.addEventListener('mouseenter', () => {
            if (this.mouseDown && cell.isClicked) {
                this.highlightSurrounding(cell);
            }
        });
        gameCell.addEventListener('mouseleave', () => {
            if (this.mouseDown && cell.isClicked) {
                this.refresh();
            }
        });

        gameCell.addEventListener('click', () => {
            if (cell.isFlagged || cell.isClicked) {
                return;
            }

            cell.isClicked = true;
            if (cell.type === 'mine') {
                this.handleMineClick(cell);
            }
            if (cell.type === '0') {
                this.revealNext(cell);
            }

            if (this.hasPlayerWon()) {
                this.handleWin();
            }
            this.refresh();
        });

        gameCell.addEventListener('contextmenu', () => {
            if (cell.isClicked) {
                return;
            }
            if (cell.isFlagged) {
                cell.isFlagged = false;
                this.refresh();
                return;
            }
            if (this.countFlags() <= 0) {
                return;
            }
            cell.isFlagged = true;
            this.refresh();
        });
    }

    handleMineClick(cell) {
        cell.type = 'mine-red';
        this.allMines.forEach((mine) => {
            mine.isFlagged = false;
            mine.isClicked = true;
        });
        this.isOver = true;
        clearInterval(this.timer);
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

    highlightSurrounding(cell) {
        for (let direction of Directions.directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;

            if (!this.isCellOnBoard(nextX, nextY)) {
                continue;
            }

            let nextCell = this.board[nextX][nextY];
            let nextCellImg = this.getCellElementByCoordinates(nextCell.x, nextCell.y).firstElementChild;
            if (!nextCell.isClicked && !nextCell.isFlagged) {
                nextCellImg.setAttribute('src', `/images/0.png`);
            }
        }
    }

    handleWin() {
        this.allMines.forEach((mine) => mine.isFlagged = true);
        this.isOver = true;
        clearInterval(this.timer);
    }

    startTimer() {
        const timerElement = document.querySelector('#timer');
        this.timer = setInterval(() => timerElement.textContent = (parseInt(timerElement.textContent) + 1).toString(), 1000);
    }

    prepTimer() {
        const allCellNodes = document.querySelectorAll('.cell');
        allCellNodes.forEach((cell) => {
            cell.addEventListener('click', () => this.startTimer());
            cell.addEventListener('contextmenu', () => this.startTimer());
        });
    }

    setCellImage(cell, image) {
        if (cell.isFlagged) {
            image.setAttribute('src', `/images/flagged.png`);
            return;
        }
        if (!cell.isClicked) {
            image.setAttribute('src', `/images/face-down.png`);
            return;
        }
        image.setAttribute('src', `/images/${cell.type}.png`);
    }

    refresh() {
        const flagCounter = document.querySelector('#flag-counter');
        flagCounter.textContent = this.countFlags();
        this.container.innerHTML = '';
        for (let i = 0; i < this.sizeX; i++) {
            let gameRow = this.gamePieceFactory.getGameRow();
            for (let j = 0; j < this.sizeY; j++) {
                let cell = this.board[i][j];

                let gameCell = this.gamePieceFactory.getGameCell();
                let image = gameCell.firstElementChild;
                this.setCellImage(cell, image);
                gameCell.dataset.x = cell.x.toString();
                gameCell.dataset.y = cell.y.toString();
                if (!this.isOver) {
                    this.prepGameCell(gameCell);
                }
                gameRow.appendChild(gameCell);
            }
            this.container.appendChild(gameRow);
        }
    }
}

new Game(9, 9, 10);