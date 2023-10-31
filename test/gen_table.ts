import * as bf from "../src/helpers.js";

console.log(
    bf.genTable([
        ["5m", "SELL", "BUY", "BUY"],
        ["15m", "BUY", "BUY", "BUY"],
        ["1h", "SELL", "SELL", "SELL"],
        ["4h", "NEUTRAL", "STRONG_SELL", "SELL"],
    ]).toString(),
);

