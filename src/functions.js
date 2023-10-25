import * as bf from "./helpers.js";
import config from "./config.js";

import TradingView from "@mathieuc/tradingview";
import moment from "moment";

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

export async function getTradingViewSignal(timeframe) {
    return new Promise((resolve, reject) => {
        const client = new TradingView.Client();
        const chart = new client.Session.Chart();

        chart.setMarket("BINANCE:" + config.tradingview.symbol, {
            timeframe: timeframe,
            range: 1,
            // to: 1600000000,
        });

        TradingView.getIndicator(config.tradingview.indicator).then(
            async (indic) => {
                const STD = new chart.Study(indic);

                STD.onUpdate(async () => {
                    const data = STD.periods;
                    const currentTime = moment().unix();
                    const currentPrice = chart.periods[0].close;

                    // mencdapatkan data signal
                    const signalBuy =
                        data[0][config.tradingview.buy.key] ==
                        config.tradingview.buy.value;
                    const signalSell =
                        data[0][config.tradingview.sell.key] ==
                        config.tradingview.sell.value;

                    let signal = 0;
                    if (signalBuy) {
                        signal = 1;
                    } else if (signalSell) {
                        signal = -1;
                    }
                    client.end();

                    resolve({
                        time: moment
                            .unix(currentTime)
                            .format("YYYY-MM-DD HH:mm:ss"),
                        signal: signal,
                        price: currentPrice,
                    });
                });
            },
        );
    });
}
