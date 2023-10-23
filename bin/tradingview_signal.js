#!/usr/bin/env node

import config from "./../src/config.js";
import * as fn from "./../src/functions.js";
import * as bf from "./../src/helpers.js";
import TradingView from "@mathieuc/tradingview";
import moment from "moment";

const client = new TradingView.Client();
const chart = new client.Session.Chart();

chart.setMarket("BINANCE:" + config.tradingview.symbol, {
    timeframe: config.tradingview.timeframe,
    range: 1,
    // to: 1600000000,
});

TradingView.getIndicator(config.tradingview.indicator).then(async (indic) => {
    console.log(`Loading '${indic.description}' study...`);
    const STD = new chart.Study(indic);

    STD.onUpdate(async () => {
        const data = STD.periods;
        const currentTime = moment().unix();
        const currentPrice = chart.periods[0].close;

        // mencdapatkan data signal
        const signalBuy =
            data[0][config.tradingview.buy.key] == config.tradingview.buy.value;
        const signalSell =
            data[0][config.tradingview.sell.key] ==
            config.tradingview.sell.value;

        let signal = 0;
        if (signalBuy) {
            signal = 1;
        } else if (signalSell) {
            signal = -1;
        }

        console.log({
            time: moment.unix(currentTime).format("YYYY-MM-DD HH:mm:ss"),
            signal: signal,
            price: currentPrice,
        });

        if (signal == 0) {
            bf.sendMessage(
                `price: ${currentPrice}\n\n<b>Signal: ${
                    signal < 0 ? "SHORT" : "LONG"
                }</b>`,
            );
        }

        client.end();
    });
});
