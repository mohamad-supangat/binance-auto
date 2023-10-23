#!/usr/bin/env node

import config from "./../src/config.js";
import esMain from "es-main";

import * as bf from "./../src/helpers.js";

const binance = bf.binanceClient();

/**
 * mendapatkan target profit  yang di dapat berdasarkan level
 * level di akumulasikan terhadap konfigurasi
 *
 * @param {any} lvl target lvl pnl
 */
export function getTarget(lvl) {
    let target = 0;
    if (lvl <= 1) {
        target = config.stop_loss.min_pnl;
    } else {
        target = config.stop_loss.min_pnl + config.stop_loss.every * lvl;
    }

    return {
        target: target,
        condition: target + config.stop_loss.spread,
    };
}

/**
 * @param {any} pnl profit sekarang
 * @returns {} inf lvl stop_loss berdasarkan config dan pnl yang di kirimkan
 */
export function getLvl(pnl) {
    let lvl = 1;
    while (true) {
        const target = getTarget(lvl);
        if (pnl >= target.condition) {
            lvl++;
        } else {
            break;
        }
    }
    return lvl - 1;
}

async function main() {
    let hasStopOrder = false;
    let lsLvl;
    let slTarget;
    let position = await bf.getPosition(binance);
    // console.log(position);

    if (position) {
        const entryPrice = position.entryPrice;
        const currentPnl = position.pnl;

        // mendapatkan lvl stop loss untuk pnl sekarang
        lsLvl = getLvl(currentPnl);

        // jika lvl = 0 / belum mendapatkan kondisi open stop loss, maka lewati
        if (lsLvl == 0) {
            console.log(lsLvl, position);
            return;
        }

        // mendapatkan target kondisi stop loss
        slTarget = getTarget(lsLvl);

        // membuat stop price untuk pnl sekarang
        const targetStopPrice = await bf.generateExitPrice(
            position.type,
            entryPrice,
            slTarget.target,
            position.qty,
        );

        console.log("targetStopPrice, ", {
            entryPrice,
            targetStopPrice,
        });

        // mengambil data semua stop loss orders
        const stopLossOrders = await bf.getStopOrders(binance);

        for (const order of stopLossOrders) {
            // jika open order merupakan stop loss dengan level yang sama maka jangandi close  jika iya maka close saja
            if (
                order.type != position.type &&
                order.stopPrice == targetStopPrice
            ) {
                hasStopOrder = true;
            } else {
                // console.log(order);
                await bf.cancelOrder(binance, order.id);
            }
        }

        // jika tidak mempunyai stop loss maka buat
        if (!hasStopOrder) {
            await bf.submitStopLossOrder(
                binance,
                position.type,
                Number(position.qty) * 2,
                targetStopPrice,
            );
            // bf.submit
        }
    }

    let logData = {
        hasPosition: !!position,
        hasStopOrder,
    };

    if (!!position == true) {
        logData = {
            lsLvl,
            slTarget,
            ...logData,
            ...position,
        };
    }

    console.log(bf.currentTime(), logData);
}

// jika tidak di import dimana mana maka run fungsi check
// console.log(import);
if (esMain(import.meta)) {
    main();
}
