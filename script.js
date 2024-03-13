const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;
const EMPTY = 4;

const BOARD_ID = "board";
const SELECTOR_UP_ID = "up";
const SELECTOR_DOWN_ID = "down";
const SELECTOR_LEFT_ID = "left";
const SELECTOR_RIGHT_ID = "right";
const COUNT_UP = "up_count";
const COUNT_DOWN = "down_count";
const COUNT_LEFT = "left_count";
const COUNT_RIGHT = "right_count";

class Selector {
    constructor() {
        this.selected = UP;
    }
    clickFunc(direction) {
        this.selected = direction;
    }
    draw() {
        let up = document.getElementById(SELECTOR_UP_ID);
        let down = document.getElementById(SELECTOR_DOWN_ID);
        let left = document.getElementById(SELECTOR_LEFT_ID);
        let right = document.getElementById(SELECTOR_RIGHT_ID);
        let cells = [up, right, down, left];
        for (let cell of cells) cell.style.backgroundColor = "white";
        cells[this.selected].style.backgroundColor = "pink";
        up.innerHTML = '↑';
        down.innerHTML = '↓';
        left.innerHTML = '←';
        right.innerHTML = '→';
    }
    setClickFunc() {
        let up = document.getElementById(SELECTOR_UP_ID);
        let down = document.getElementById(SELECTOR_DOWN_ID);
        let left = document.getElementById(SELECTOR_LEFT_ID);
        let right = document.getElementById(SELECTOR_RIGHT_ID);
        up.addEventListener('click', () => { this.clickFunc(UP); });
        down.addEventListener('click', () => { this.clickFunc(DOWN); });
        left.addEventListener('click', () => { this.clickFunc(LEFT); });
        right.addEventListener('click', () => { this.clickFunc(RIGHT); });
    }
}

class Cell {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.up = null;
        this.down = null;
        this.left = null;
        this.right = null;
    }
    toStr() {
        let str = ["↑", "→", "↓", "←", ""];
        return str[this.direction];
    }
    draw() {
        let board = document.getElementById(BOARD_ID);
        board.rows[this.y].cells[this.x].innerHTML = this.toStr();
    }
    isEmpty() {
        return this.direction == EMPTY;
    }
    isNotEmpty() {
        return !this.isEmpty();
    }
    nextCell(direction) {
        if (direction == UP) return this.up;
        if (direction == DOWN) return this.down;
        if (direction == LEFT) return this.left;
        if (direction == RIGHT) return this.right;
    }
    setColor(color) {
        let board = document.getElementById(BOARD_ID);
        board.rows[this.y].cells[this.x].style.backgroundColor = color;
    }
    setDirection(direction) {
        this.direction = direction;
    }
    rotate() {
        this.direction = (this.direction + 1) % 4;
    }
}

class Board {
    constructor() {
        this.cells = [];
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                let cell = new Cell(x, y, EMPTY);
                this.cells.push(cell);
            }
        }
        this.cell(2, 2).direction = UP;
        this.connectCells();
    }
    draw() {
        for (let cell of this.cells) {
            cell.draw();
        }
    }
    cell(x, y) {
        return this.cells.find((c) => c.x == x && c.y == y);
    }
    connectCells() {
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                let cell = this.cell(x, y);
                if (y != 0) cell.up = this.cell(x, y - 1);
                if (y != 4) cell.down = this.cell(x, y + 1);
                if (x != 0) cell.left = this.cell(x - 1, y);
                if (x != 4) cell.right = this.cell(x + 1, y);
            }
        }
    }
    paintWhite() {
        for (let cell of this.cells) {
            cell.setColor("white");
        }
    }
}

class Counter {
    constructor() {
        this.up = 0;
        this.down = 0;
        this.left = 0;
        this.right = 0;
    }
    count(board) {
        this.up = 0;
        this.down = 0;
        this.left = 0;
        this.right = 0;
        for (let cell of board.cells) {
            if (cell.direction == UP) this.up++;
            if (cell.direction == DOWN) this.down++;
            if (cell.direction == LEFT) this.left++;
            if (cell.direction == RIGHT) this.right++;
        }
    }
    draw() {
        let up = document.getElementById(COUNT_UP);
        let down = document.getElementById(COUNT_DOWN);
        let left = document.getElementById(COUNT_LEFT);
        let right = document.getElementById(COUNT_RIGHT);
        up.innerHTML = this.up;
        down.innerHTML = this.down;
        left.innerHTML = this.left;
        right.innerHTML = this.right;
    }
}

class Hand {
    constructor(cell, direction) {
        this.cell = cell;
        this.direction = direction;
    }
    isLegal() {
        if (this.cell.isNotEmpty()) return false;
        if (this.cell.nextCell(this.direction) == null) return false;
        if (this.cell.nextCell(this.direction).isEmpty()) return false;
        return true;
    }
}

class CellEventManager {
    constructor(board, selector, turn) {
        this.board = board;
        this.selector = selector;
        this.turn = turn;
    }
    setEvent() {
        let board_element = document.getElementById(BOARD_ID);
        for (let cell of this.board.cells) {
            let x = cell.x;
            let y = cell.y;
            board_element.rows[y].cells[x].addEventListener("click", this.clickFunc.bind(this));
        }
    }
    clickFunc(e) {
        let n = Number(e.target.id);
        let x = n % 5;
        let y = Math.floor(n / 5);
        let cell = this.board.cell(x, y);
        let hand = new Hand(cell, this.selector.selected);
        if (hand.isLegal()) this.turn.put(hand);
    }
}

class Turn {
    constructor() {
        this.isInProgress = false;
        this.activeCell = null;
    }
    put(hand) {
        if (this.isInProgress) return;
        this.isInProgress = true;
        hand.cell.setDirection(hand.direction);
        this.activeCell = hand.cell.nextCell(hand.direction);
    }
    rotate() {
        if (this.isInProgress == false) return;
        this.activeCell.rotate();
        let nextCell = this.activeCell.nextCell(this.activeCell.direction);
        if (nextCell == null || nextCell.isEmpty()) {
            this.isInProgress = false;
            return;
        }
        this.activeCell = nextCell;
    }
}

class Game {
    constructor() {
        this.board = new Board();
        this.selector = new Selector();
        this.counter = new Counter();
        this.turn = new Turn();
        this.cellEventManager = new CellEventManager(this.board, this.selector, this.turn);

        this.selector.setClickFunc();
        this.cellEventManager.setEvent();

        setInterval(this.draw.bind(this), 30);
        setInterval(this.rotate.bind(this), 1000);
        setInterval(this.count.bind(this), 30);
    }
    draw() {
        this.selector.draw();
        this.board.draw();
        this.counter.draw();
        this.paintLegalHand();
    }
    rotate() {
        this.turn.rotate();
    }
    count() {
        this.counter.count(this.board);
    }
    paintLegalHand() {
        if (this.turn.isInProgress) {
            this.board.paintWhite();
            return;
        }
        let legalHands = [];
        let illegalHands = [];
        for (let cell of this.board.cells) {
            let hand = new Hand(cell, this.selector.selected);
            if (hand.isLegal()) legalHands.push(hand);
            else illegalHands.push(hand);
        }
        for (let hand of legalHands) {
            hand.cell.setColor("pink");
        }
        for (let hand of illegalHands) {
            hand.cell.setColor("white");
        }
    }
}

let g = new Game();