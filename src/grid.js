import data from "./data.js";
import { grid, sum, weightedRandom } from "./utils.js";

/**
 * @class
 */
export class Cell {
    /**
     * @param {MappingData} mapping -
     */
    constructor (mapping) {
        this.mapping = mapping;
        this.possibilities = Object.keys(mapping);
        this.data = null;
    }

    /**
     * @return {number}
     */
    getEntropy () {
        const sumWeights = sum(...this.possibilities.map(key => this.mapping[key].weight));
        return this.possibilities.length + sum(...this.possibilities.map((key) => {
            const p = this.mapping[key].weight / sumWeights;
            return p * Math.log2(p);
        }));
    }

    /**
     * @return {string}
     */
    choose () {
        const sumWeights = sum(...this.possibilities.map(key => this.mapping[key].weight));
        return weightedRandom(this.possibilities.reduce((obj, key) => {
            obj[key] = this.mapping[key].weight / sumWeights;
            return obj;
        }, {}));
    }

    /**
     * @param {string} choice -
     * @return {string}
     */
    collapse (choice) {
        this.data = this.mapping[choice];
        this.possibilities = [];

        if (!this.data) {
            throw new Error(`Unknown chose id [${choice}]`);
        }

        return choice;
    }

    /**
     * @param {Set<string>} possible -
     * @return {boolean}
     */
    canReduce (possible) {
        return this.possibilities.filter(id => possible.has(id)).length > 0;
    }

    /**
     * @param {Set<string>} possible -
     * @return {Cell}
     */
    reduce (possible) {
        if (this.getEntropy() !== 0) {
            this.possibilities = this.possibilities.filter(id => possible.has(id));

            if (this.possibilities.length === 0) {
                throw new Error("Cell entropy reduce to 0");
            }
        }
        return this;
    }

    /**
     * Render this cell
     * @param {CanvasRenderingContext2D} ctx -
     * @param {Image} tileset -
     */
    render (ctx, tileset) {
        const { size, margin, zoom } = data;
        if (this.data) {
            const [x, y] = this.data.pos;
            const sourceSize = size + margin;
            ctx.drawImage(tileset, x * sourceSize, y * sourceSize, size, size, 0, 0, size * zoom, size * zoom);
        }
        else {
            ctx.font = `${size}px arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(Math.round(this.getEntropy()), (size * zoom) / 2, (size * zoom) / 2);
        }
    }
}

/**
 * @class
 */
export default class Grid {
    /**
     * @param {number} width -
     * @param {number} height -
     * @param {MappingData} mapping -
     */
    constructor (width, height, mapping) {
        this.width = width;
        this.height = height;
        this.mapping = mapping;
        this.helper = grid(width, height);

        /**
         * @type {Cell[]}
         */
        this.cells = [...new Array(width * height)].map(() => new Cell(mapping));
    }

    /**
     * Get a cell in the grid
     * @param {number} x -
     * @param {number} y -
     * @return {Cell|null}
     */
    getCell (x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }

        const cell = this.cells[x + y * this.width];

        return cell ?? null;
    }

    /**
     * @param {number} index -
     * @return {[number, number]}
     */
    getPosition (index) {
        return this.helper.getPosition(index);
    }

    /**
     * Return the lowest entropy cell (or random if tie)
     * @return {Cell|null}
     */
    findLowestEntropy () {
        let lowests = [];
        let entropy = Infinity;

        this.cells.forEach((cell) => {
            const e = cell.getEntropy();
            if (e < entropy && e > 0) {
                entropy = e;
                lowests = [cell];
            }
            else if (e === entropy) {
                lowests.push(cell);
            }
        });

        if (lowests.length) {
            return lowests[Math.floor(Math.random() * lowests.length)];
        }

        return null;
    }

    /**
     * @param {number} x -
     * @param {number} y -
     * @return {[Cell, Cell, Cell, Cell]}
     */
    around (x, y) {
        return [
            this.getCell(x, y - 1),
            this.getCell(x + 1, y),
            this.getCell(x, y + 1),
            this.getCell(x - 1, y),
        ];
    }

    /**
     * Collapse the lowest entropy cell
     * @return {boolean}
     */
    collapseCell () {
        const cell = this.findLowestEntropy();

        if (cell) {
            const choice = cell.choose();
            const { neighbors } = this.mapping[choice];
            const index = this.cells.indexOf(cell);
            const [x, y] = this.getPosition(index);
            console.log(`Collapsing [${x}, ${y}] into ${choice}`);

            // All cells around are either outbound, already collapsed or can reduce with said constraints
            if (this.around(x, y).every(
                (around, i) => around === null || around.data || around.canReduce(neighbors[i]),
            )) {
                cell.collapse(choice);
                this.around(x, y).forEach((around, i) => {
                    if (around && !around.data) {
                        console.log(`Reducing [${this.getPosition(this.cells.indexOf(around))}]`);
                        around.reduce(neighbors[i]);
                    }
                });
            }

            return true;
        }

        return false;
    }

    /**
     * Render the whole grid
     * @param {CanvasRenderingContext2D} ctx -
     * @param {Image} tileset -
     */
    render (ctx, tileset) {
        const { size, zoom } = data;
        ctx.clearRect(0, 0, this.width * size * zoom, this.height * size * zoom);

        this.cells.forEach((cell, index) => {
            ctx.save();
            const [x, y] = this.getPosition(index);
            ctx.translate(x * size * zoom, y * size * zoom);
            cell.render(ctx, tileset);
            ctx.restore();
        });
    }
}
