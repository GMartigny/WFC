/**
 * Async load an Image
 * @param {string} url - URL of the image
 * @return {Promise<HTMLImageElement>}
 */
function load (url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", error => reject(error));
    });
}

/**
 * Get a canvas from the DOM
 * @param {string} [id] - HTML id attribute (or create it if omited)
 * @param {number} [width] - Width to set
 * @param {number} [height] - Height to set
 * @return {CanvasRenderingContext2D}
 */
function getCanvas (id, width, height) {
    const canvas = id ? document.getElementById(id) : document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (width && height) {
        canvas.width = width;
        canvas.height = height;
    }
    ctx.imageSmoothingEnabled = false;

    return ctx;
}

/**
 * @typedef {Object} GridHelper
 * @property {function} getIndex
 * @property {function} getPosition
 */
/**
 * @param {number} width - Width
 * @param {number} height - Height
 * @return {GridHelper} Help to deal with linear grid
 */
function grid (width, height) {
    return {
        /**
         * @param {number} x -
         * @param {number} y -
         * @return {number|null}
         */
        getIndex (x, y) {
            if (x < 0 || x > width || y < 0 || y > height) {
                return null;
            }
            return x + (y * width);
        },
        /**
         * @param {number} index -
         * @return {[number, number]}
         */
        getPosition (index) {
            return [
                index % width,
                Math.floor(index / width),
            ];
        },
    };
}

/**
 * @param {number} time - Time in ms
 * @return {Promise}
 */
function wait (time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

/**
 * @param {...number} values - Any numerical value
 * @return {number}
 */
function sum (...values) {
    return values.reduce((acc, val) => acc + val, 0);
}

/**
 * @param {Object<number>} spec - { key: weight }
 * @return {string}
 */
function weightedRandom (spec) {
    const s = sum(...Object.values(spec));
    let acc = 0;
    const pick = Math.random() * s;
    return Object.keys(spec).find((key) => {
        acc += spec[key];
        return pick <= acc;
    });
}

export {
    load,
    getCanvas,
    grid,
    wait,
    sum,
    weightedRandom,
};
