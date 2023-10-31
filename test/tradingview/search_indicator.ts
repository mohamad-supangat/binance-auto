import TradingView from "@mathieuc/tradingview";
console.log(process.argv[2]);
/*
  This example tests the searching
  functions such as 'searchMarket'
  and 'searchIndicator'
*/

// TradingView.searchMarket("BINANCE:").then((rs) => {
//   console.log("Found Markets:", rs);
// });
//
TradingView.searchIndicator("UT Bot Alert").then((rs) => {
  console.log("Found Indicators:", rs);
});

