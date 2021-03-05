require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGODB_URI,
  twitterApi: process.env.TWITTER_API,
  twitterApiSecret: process.env.TWITTER_API_SECRET,
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
  binanceApiKey: process.env.BINANCE_API_KEY,
  binanceApiSecret: process.env.BINANCE_API_SECRET,
};
