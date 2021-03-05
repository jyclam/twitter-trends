const { init } = require("./loaders/index");
const { port } = require("./config/index");

const twitterService = require("./services/twitter/index");

const state = new Map();

const main = async () => {
  const { server, wss } = await init();

  // fetch latest tweet and set to state
  try {
    const latestTweet = await twitterService.getLatestTweet();
    latestTweet
      ? state.set("latestTweetId", latestTweet.id)
      : state.set("latestTweetId", "1357231313376456708"); // first elon tweet regarding doge

    console.log("Most Recent Tweet Id: ", state.get("latestTweetId"));
  } catch (error) {
    console.error("Error getting most recent tweet");
    console.error(error);
  }

  wss.on("connection", (ws, req) => {
    // query db and send to client
    twitterService
      .getFirstLoadData()
      .then(({ tweets, users }) => {
        console.log(`Sending ${tweets.length} tweets.`);
        ws.send(JSON.stringify({ tweets }));
        console.log(`Sending ${users.length} users.`);
        ws.send(JSON.stringify({ users }));
      })
      .catch((error) => {
        console.error("Error querying for first load data.");
        console.error(error);
      });
  });

  server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });

  twitterService.pollAndBroadcast(state, broadcastToAll);

  function broadcastToAll(msg) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === client.OPEN) {
        client.send(msg);
      }
    });
  }
};

main();
