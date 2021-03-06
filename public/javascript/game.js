import {directions} from "./directions.js";
import {GamePieceFactory} from "./gamePieceFactory.js";
import {Cell} from "./cell.js";

export class Game {
    constructor(sizeX, sizeY, minesCount, page) {
        this.page = page;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.minesCount = minesCount;
        this.isOver = false;
        this.hasStarted = false;
        this.starterCellCount = 15;

        this.board = [];
        for (let i = 0; i < sizeX; i++) {
            this.board.push([]);
            for (let j = 0; j < sizeY; j++) {
                this.board[i].push(new Cell(i, j));
            }
        }
        this.allCells = this.board.flat();

        this.buildTable();
        this.allGameCells = this.allCells.map((cell) => cell.gameCell);
        this.prepTimer();
    }

    initGame() {
        this.randomizeMines();
        this.calculateValues();
        this.allMines = this.allCells.filter((cell) => cell.type === 'mine');
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

    updateFlagCounter() {
        const flagCounter = document.querySelector('#flag-counter');
        flagCounter.textContent = this.countFlags();
    }

    randomizeMines() {
        let mines = this.minesCount;
        while (mines > 0) {
            let randomIndex = Math.floor(Math.random() * this.allCells.length);
            if (this.allCells[randomIndex].type !== 'mine' && !this.allCells[randomIndex].isStarter) {
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
            for (let direction of directions) {
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

    prepGameCell(cell) {
        const gameCell = cell.gameCell;

        gameCell.addEventListener('mousedown', () => {
            if (cell.isClicked) {
                this.highlightSurrounding(cell);
            }
        });
        gameCell.addEventListener('mouseup', () => {
            if (!cell.isClicked) return;
            if (this.countSurroundingFlags(cell) >= parseInt(cell.type)) {
                this.revealSurrounding(cell);
            } else {
                this.resetSurrounding(cell);
            }
        });
        gameCell.addEventListener('mouseenter', () => {
            if (this.page.mouseDown && cell.isClicked) {
                this.highlightSurrounding(cell);
            }
        });
        gameCell.addEventListener('mouseleave', () => {
            if (this.page.mouseDown && cell.isClicked) {
                this.resetSurrounding(cell);
            }
        });

        gameCell.addEventListener('click', () => {
            if (!this.hasStarted) {
                this.hasStarted = true;
                this.markStarterCell(cell);
                this.initGame();
            }
            this.revealCell(cell);
        });

        gameCell.addEventListener('contextmenu', () => {
            if (cell.isClicked) {
                return;
            }
            if (cell.isFlagged) {
                cell.isFlagged = false;
                cell.setImage();
                this.updateFlagCounter();
                return;
            }
            if (this.countFlags() <= 0) {
                return;
            }
            cell.isFlagged = true;
            cell.setImage();
            this.updateFlagCounter();
        });
    }

    revealCell(cell) {
        if (cell.isFlagged || cell.isClicked) {
            return;
        }
        cell.isClicked = true;
        if (cell.type === 'mine') {
            this.handleMineClick(cell);
            return;
        }
        if (cell.type === '0') {
            this.revealNext(cell);
        }
        cell.setImage();
        if (this.hasPlayerWon()) {
            this.handleWin();
        }
    }

    handleMineClick(cell) {
        cell.type = 'mine-red';
        this.allCells.forEach((cell) => cell.isFlagged = false);
        this.allMines.forEach((mine) => {
            mine.isClicked = true;
        });
        this.isOver = true;
        clearInterval(this.timer);
        this.buildTable();
        this.page.setFace('lose');
    }

    markStarterCell(cell) {
        cell.isStarter = true;
        this.starterCellCount--;
        let nextCell;
        for (let direction of directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;
            if (!this.isCellOnBoard(nextX, nextY)) continue;
            nextCell = this.board[nextX][nextY];
            if (nextCell.isStarter) continue;
            nextCell.isStarter = true;
            this.starterCellCount--;
        }
        if (this.starterCellCount > 0) {
            this.markStarterCell(nextCell);
        }
    }

    revealNext(cell) {
        for (let direction of directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;
            if (!this.isCellOnBoard(nextX, nextY))continue;
            const nextCell = this.board[nextX][nextY];
            if (nextCell.type === 'mine') continue;
            if (!nextCell.isClicked) {
                nextCell.isClicked = true;
                nextCell.isFlagged = false;
                nextCell.setImage();
                if (nextCell.type === "0") {
                    this.revealNext(nextCell);
                }
            }
        }
    }

    highlightSurrounding(cell) {
        for (let direction of directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;
            if (!this.isCellOnBoard(nextX, nextY)) continue;
            const nextCell = this.board[nextX][nextY];
            if (!nextCell.isClicked && !nextCell.isFlagged) {
                nextCell.highlightImage();
            }
        }
    }

    revealSurrounding(cell) {
        for (let direction of directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;
            if (!this.isCellOnBoard(nextX, nextY)) continue;
            const nextCell = this.board[nextX][nextY];
            if (nextCell.isFlagged) continue;
            if (nextCell.type === 'mine') {
                this.revealCell(nextCell);
                return;
            }
        }
        for (let direction of directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;
            if (!this.isCellOnBoard(nextX, nextY)) continue;
            const nextCell = this.board[nextX][nextY];
            if (nextCell.isFlagged) continue;
            this.revealCell(nextCell);
        }
    }

    resetSurrounding(cell) {
        for (let direction of directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;
            if (!this.isCellOnBoard(nextX, nextY)) continue;
            const nextCell = this.board[nextX][nextY];
            if (nextCell.isFlagged) continue;
            nextCell.setImage();
        }
    }

    countSurroundingFlags(cell) {
        let flagCount = 0;
        for (let direction of directions) {
            let nextX = cell.x + direction.x;
            let nextY = cell.y + direction.y;
            if (!this.isCellOnBoard(nextX, nextY)) continue;
            if (this.board[nextX][nextY].isFlagged) flagCount++;
        }
        return flagCount;
    }

    handleWin() {
        this.allMines.forEach((mine) => mine.isFlagged = true);
        this.isOver = true;
        clearInterval(this.timer);
        this.buildTable();
        this.page.setFace('win');
    }

    startTimer() {
        const timerElement = document.querySelector('#timer');
        this.timer = setInterval(() => {
            if (timerElement.textContent === '999' || this.isOver) {
                return;
            }
            timerElement.textContent = (parseInt(timerElement.textContent) + 1).toString();
        }, 1000);
        this.buildTable();
    }

    prepTimer() {
        this.allGameCells.forEach((cell) => {
            cell.addEventListener('click', () => this.startTimer());
            cell.addEventListener('contextmenu', () => this.startTimer());
        });
    }

    buildTable() {
        const gameField = document.querySelector('#game-field');
        gameField.innerHTML = '';
        for (let row of this.board) {
            let gameRow = GamePieceFactory.getGameRow();
            for (let cell of row) {
                cell.gameCell = GamePieceFactory.getGameCell();
                cell.setImage();
                if (!this.isOver) {
                    this.prepGameCell(cell);
                }
                gameRow.appendChild(cell.gameCell);
            }
            gameField.appendChild(gameRow);
        }
        this.updateFlagCounter();
    }
}