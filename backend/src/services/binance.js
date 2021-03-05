const fetch = require("node-fetch");

const dayjs = require("dayjs");

exports.fetchKlineData = (time, symbol = "DOGEUSDT", interval = "5m") => {
  // const start = dayjs(time).subtract(1, "hour");
  // const end = dayjs(time).add(24, "hour");

  fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`,
  )
    .then((res) => res.json())
    .then((json) => console.log(json));
};
