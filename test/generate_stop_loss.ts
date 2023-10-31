import * as bf from "../src/helpers.js";
import config from "../src/config.js";
import * as sl from "../bin/auto_stop_loss.js";

/**
 * Melakukan simulasi generator stop loss
 */

const binance = bf.binanceClient();
const type = 1; // 1 = buy -1 = sell

// dapatkan harga sekarang
const price = (await bf.currentPrice(binance)) + "";
// console.info("current price", price);

// simulasikan pembelian qty
const qty = await bf.generateQty(price);

// simulasi berapa pnl sekarang
const pnl = 0.25;

// simulasi untuk mendapatkan harga jual yang sesuai dengan pnl, qty dan harga
const exitPrice = await bf.generateExitPrice(type, price, pnl, qty);

// dapakan simulasi target level berapa seakarang
// hasil di harapkan dari settingan config
const lvlTarget = sl.getLvl(pnl);

// daapatkan target stoplos untuk target / kondisi stop loss terkait
const slTarget = sl.getTarget(lvlTarget);

console.log({
    qty,
    price,
    pnl,
    exitPrice,
    lvlTarget,
    slTarget,
});
