#!/usr/bin/env node

import config from "./../src/config.js";
import * as fn from "./../src/functions.js";
import * as bf from "./../src/helpers.js";

// send current status
const status = await fn.getStatus();
await bf.sendMessage(status);

const ta = await fn.tradingViewTA();
await bf.sendMessage(ta);
