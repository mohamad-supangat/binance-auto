#!/usr/bin/env node

import config from "./../src/config.js";
import * as fn from "./../src/functions.js";
import * as bf from "./../src/helpers.js";

const timeframes = {
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1h": "60",
    "2h": "120",
    "4h": "240",
};

for (const [label, timeframe] of Object.entries(timeframes)) {
    const { signal, price } = await fn.getTradingViewSignal(timeframe);

    console.log({
        label,
        signal,
    });

    if (signal != 0) {
        bf.sendMessage(
            `<b>Timeframe ${label}</b>\nprice: ${price}\n\n<b>Signal: ${
                signal < 0 ? "SHORT" : "LONG"
            }</b>`,
        );
    }
}
