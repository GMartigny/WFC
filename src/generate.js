import { wait } from "./utils.js";
import Grid from "./grid.js";

/**
 * @typedef {Object} TileData
 * @prop {[number, number]} pos
 * @prop {[Set, Set, Set, Set]} neighbors
 * @prop {number} weight
 */

/**
 * @typedef {Object<TileData>} MappingData
 */

/**
 * Start the generation
 * @param {CanvasRenderingContext2D} ctx -
 * @param {number} width -
 * @param {number} height -
 * @param {Image} tileset -
 * @param {MappingData} mapping -
 * @return {Promise<void>}
 */
export default async function generate (ctx, width, height, tileset, mapping) {
    const grid = new Grid(width, height, mapping);
    window.grid = grid;

    const stepTime = 20;

    return (async function step () {

        const collapsed = grid.collapseCell();
        grid.render(ctx, tileset);

        if (collapsed) {
            await wait(stepTime);
            return step();
        }

        return "ok";
    }());
}
