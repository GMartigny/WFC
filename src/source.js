import data from "./data.js";
import { getCanvas, load, grid } from "./utils.js";

/**
 * @param {number} r - Red channel
 * @param {number} g - Green channel
 * @param {number} b - Blue channel
 * @return {string}
 */
function getHex (r, g, b) {
    // eslint-disable-next-line no-bitwise
    return `#${((r << 16) | (g << 8) | b).toString(16)}`;
}

/**
 * @typedef {Object} TileData
 * @property {[number, number]} pos
 * @property {number} weight
 * @property {[Set<string>, Set<string>, Set<string>, Set<string>]} neighbors
 */
/**
 * @param {HTMLImageElement} tileset -
 * @return {Promise<Object<TileData>>}
 */
export default async function drawSource (tileset) {
    const tiles = {};
    const sandbox = getCanvas();

    const [mapping, example] = await Promise.all([
        load(data.mapping),
        load(data.example),
    ]);

    const { size, margin, zoom } = data;

    // Scan existing tiles in mapping image
    sandbox.canvas.width = mapping.width;
    sandbox.canvas.height = mapping.height;
    let helper = grid(mapping.width, mapping.height);
    sandbox.drawImage(mapping, 0, 0);
    let { data: pixels } = sandbox.getImageData(0, 0, mapping.width, mapping.height);
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3]) {
            const pos = helper.getPosition(i / 4);
            const hex = getHex(...pixels.slice(i));
            if (tiles[hex]) {
                throw new Error(`Hex color already declared ${hex}`);
            }

            tiles[hex] = {
                pos,
                weight: 0,
                neighbors: [
                    new Set(), // North
                    new Set(), // East
                    new Set(), // South
                    new Set(), // West
                ],
            };
        }
    }

    const ctx = getCanvas("source", example.width * size * zoom, example.height * size * zoom);

    // Count tiles in example and scan surroundings
    sandbox.canvas.width = example.width;
    sandbox.canvas.height = example.height;
    helper = grid(example.width, example.height);
    sandbox.drawImage(example, 0, 0);
    ({ data: pixels } = sandbox.getImageData(0, 0, example.width, example.height));
    for (let i = 0; i < pixels.length; i += 4) {
        const hex = getHex(...pixels.slice(i));
        if (!tiles[hex]) {
            throw new Error(`Unknown pixel ${hex}`);
        }
        tiles[hex].weight += 1;
        const [sx, sy] = tiles[hex].pos;
        const [dx, dy] = helper.getPosition(i / 4);

        [
            helper.getIndex(dx, dy - 1),
            helper.getIndex(dx + 1, dy),
            helper.getIndex(dx, dy + 1),
            helper.getIndex(dx - 1, dy),
        ].forEach((index, n) => {
            if (index !== null) {
                tiles[hex].neighbors[n].add(getHex(...pixels.slice(index * 4)));
            }
        });

        const from = [
            sx * (size + margin),
            sy * (size + margin),
        ];
        const to = [
            Math.round(dx * size * zoom),
            Math.round(dy * size * zoom),
        ];
        ctx.drawImage(
            tileset,
            ...from,
            size,
            size,
            ...to,
            size * zoom,
            size * zoom,
        );
    }

    // Filter unused tiles
    const filtered = {};
    Object.keys(tiles).forEach((key) => {
        if (tiles[key].weight) {
            filtered[key] = tiles[key];
        }
    });

    console.log(filtered);

    return filtered;
}
