import { load, getCanvas } from "./utils.js";
import data from "./data.js";
import source from "./source.js";
import generate from "./generate.js";

const tileset = await load(data.tileset);
const mapping = await source(tileset);

const ctx = getCanvas("dest");

const form = document.getElementById("output");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    form.submit.setAttribute("disabled", "on");

    try {
        await generate(ctx, form.width.value, form.height.value, tileset, mapping);
    }
    catch (error) {
        console.error(error);
    }

    form.submit.removeAttribute("disabled");
    console.log("Done");
});

function resize () {
    ctx.canvas.width = form.width.value * data.size * data.zoom;
    ctx.canvas.height = form.height.value * data.size * data.zoom;
    ctx.imageSmoothingEnabled = false;
}
resize();

form.querySelectorAll("input[type='range']").forEach((input) => {
    const display = input.parentNode.querySelector(`[name="${input.name}"] + .value`);
    display.textContent = input.value;
    input.addEventListener("input", () => {
        display.textContent = input.value;

        resize();
    });
});
