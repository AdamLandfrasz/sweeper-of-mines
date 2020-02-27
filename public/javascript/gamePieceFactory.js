export class GamePieceFactory {
    static parser = new DOMParser();

    static getGameRow() {
        return GamePieceFactory.parser.parseFromString(`<div class="game-row"></div>`, "text/html").querySelector('div');
    }

    static getGameCell() {
        return GamePieceFactory.parser.parseFromString(`<div class="cell"><img src="" alt="cell-img" class="cell-img"></div>`, "text/html").querySelector('div');
    }
}