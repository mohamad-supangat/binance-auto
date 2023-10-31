import * as bf from "../src/helpers.js";

const ta = await bf.getTradingViewTA("6h");

console.log(ta);
// for (const signal of ["oscillators", "moving_averages", "summary"]) {
//     console.log(ta[signal]["RECOMMENDATION"]);
// }
