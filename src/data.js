const use = "/examples/grass-land/";

/**
 * @typedef {Object} GridData
 * @prop {string} tileset - All tiles
 * @prop {string} mapping - One color per tiles
 * @prop {string} example - Example display to learn from
 * @prop {number} size - Cell size
 * @prop {number} margin - Margin between cells
 * @prop {number} zoom - Output zoom
 */
export default {
    tileset: `${use}tileset.png`,
    mapping: `${use}mapping.png`,
    example: `${use}example.png`,
    size: 16,
    margin: 1,
    zoom: 2,
};
