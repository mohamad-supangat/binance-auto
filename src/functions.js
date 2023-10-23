import * as bf from "./helpers.js";
import config from "./config.js";

const binance = bf.binanceClient();

export async function tradingViewTA() {
    let intervals = [];
    for (const interval of ["5m", "15m", "1h", "4h"]) {
        let signals = [interval];
        const ta = await bf.getTradingViewTA(interval);

        for (const signal of ["oscillators", "moving_averages", "summary"]) {
            signals.push(ta[signal]["RECOMMENDATION"]);
        }
        intervals.push(signals);
    }

    const table = bf
        .genTable(intervals)
        .setHeading("int", "OSCI", "MA", "#")
        .setStyle("ascii-table")
        .toString();
    // console.log(table);
    return `<b>Trading View TA Recommendation</b>\n${config.symbol}\n\n<pre>${table}</pre>`;
}

export async function getStatus() {
    const balance = await bf.getBalance(binance);
    const currentPrice = await bf.currentPrice(binance);
    const position = await bf.getPosition(binance);

    let text = `balance : <b>${balance}</b>\n\n`;
    text += `<b>Market ${config.market}</b>\nprice : <b>${currentPrice}</b>\n\n`;

    if (position) {
        text += `position : ${position.type == 1 ? "buy" : "sell"}
qty: ${position.qty}
entry : ${position.entryPrice}
mark : ${position.markPrice}
liquidation : ${position.liquidationPrice}
pnl : <b>${position.pnl}</b>`;
    }

    return text;
}
