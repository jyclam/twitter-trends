require("dotenv").config();
const http = require("http");
const https = require("https");
const WebSocket = require("ws");
const crypto = require("crypto");

const { connect } = require("./db");
const {
  queryTweetsOptions,
  handleResponse,
  getLatestTweet,
  getRecentTweets,
  getUsers,
  USER_TWEET_TIMELINE_QUERY_INTERVAL,
} = require("./service/twitter");

const PORT = 5000;

const state = new Map();

const start = () => {
  connect("mongodb://localhost:27017/twitter-trends")
    .then(() => {
      console.log("Established connection to DB.");
    })
    .catch((err) => {
      console.error("Error connecting to DB: ", err);
    });

  // fetch latest tweet and set to state
  getLatestTweet()
    .then((latestTweet) => {
      latestTweet
        ? state.set("latestTweetId", latestTweet.id)
        : state.set("latestTweetId", "1357231313376456708"); // first elon tweet regarding doge

      console.log("Most Recent Tweet Id: ", state.get("latestTweetId"));
    })
    .catch((err) => {
      console.error("Error getting most recent tweet");
      console.error(err);
    });

  const server = http.createServer();

  // handle upgrade to ws connection
  server.on("upgrade", handleUpgrade);

  const wss = new WebSocket.Server({ server, clientTracking: true });

  wss.on("connection", (ws, req) => {
    const clientAddress = req.connection.remoteAddress;
    console.log("new connection from: ", clientAddress);

    ws.on("close", () => {
      console.log("socket closed: ", clientAddress);
    });
    ws.on("error", (error) => {
      console.error(`Websocket with ${clientAddress} error: ${error}`);
    });

    // query db and send to client on every ws connection
    // setup cache once data layer becomes more complex
    getRecentTweets()
      .then((tweets) => {
        console.log(`Sending ${tweets.length} tweets to ${clientAddress}`);
        ws.send(JSON.stringify({ tweets }));
      })
      .catch((err) => {
        console.error("Error querying for Tweets.");
        console.error(err);
      });

    getUsers()
      .then((users) => {
        console.log(`Sending ${users.length} users to ${clientAddress}`);
        ws.send(JSON.stringify({ users }));
      })
      .catch((err) => {
        console.error("Error querying for TwitterUsers.");
        console.error(err);
      });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });

  // poll twitter for new posts
  setInterval(() => {
    https
      .get(queryTweetsOptions(state.get("latestTweetId")), (resp) =>
        handleResponse(wss, resp, state.set.bind(state)),
      )
      .on("error", (err) => console.error(err));
  }, USER_TWEET_TIMELINE_QUERY_INTERVAL);
};

start();

const generateValue = (key) =>
  crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary")
    .digest("base64");

function handleUpgrade(req, socket) {
  if (req.headers["upgrade"] !== "websocket") {
    socket.end("HTTP/1.1 400 Bad Request");
    return;
  }

  const acceptKey = req.headers["sec-websocket-key"];
  const acceptHash = generateValue(acceptKey);

  const resHeaders = [
    "HTTP/1.1 101 Web Socket Protocol Handshake",
    "Connection: Upgrade",
    "Upgrade: websocket",
    `Sec-WebSocket-Accept: ${acceptHash}`,
  ];

  socket.write(resHeaders.join());
}
