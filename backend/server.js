require("dotenv").config();
const http = require("http");
const https = require("https");
const WebSocket = require("ws");
const crypto = require("crypto");

const { connect } = require("./db");
const data = require("./data");

const PORT = 5000;
// api rate limit is 900/15 min
const USER_TWEET_TIMELINE_QUERY_INTERVAL = 5000;

const start = async () => {
  try {
    await connect("mongodb://localhost:27017/twitter-trends");
  } catch (err) {
    console.error("Error connecting to DB: ", err);
  }

  const server = http.createServer();

  // handle upgrade to ws connection
  server.on("upgrade", (req, socket) => {
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
  });

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

    // catch up new client with existing data
    ws.send(JSON.stringify({ tweets: data.data }));
    ws.send(JSON.stringify({ users: data.includes.users }));
  });

  server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });

  // setInterval(() => {
  //   https
  //     .get(getOptions(), (resp) => handleResponse(wss, resp))
  //     .on("error", (err) => console.error(err));
  // }, USER_TWEET_TIMELINE_QUERY_INTERVAL);
};

start();

const state = new Map();
state.set("latestTweetId", "1358658587644596224");

const getOptions = () => ({
  hostname: "api.twitter.com",
  port: 443,
  path: `/2/users/44196397/tweets?user.fields=profile_image_url,verified&expansions=author_id&exclude=replies&since_id=${state.get(
    "latestTweetId",
  )}`,
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});

const handleResponse = (wss, resp) => {
  let data = "";

  resp.on("data", (chunk) => {
    data += chunk;
  });

  resp.on("end", () => {
    const response = JSON.parse(data);
    console.log(response);

    if (response.data) {
      state.set("latestTweetId", response.meta.newest_id);
      console.log("sending tweets: ", response.data);
      broadcastToAll(wss, JSON.stringify({ tweets: response.data }));
    }

    if (response.includes && response.includes.users) {
      console.log("sending users: ", response.includes.users);
      broadcastToAll(wss, JSON.stringify({ users: response.includes.users }));
    }
  });
};

const broadcastToAll = (wss, msg) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
};

const generateValue = (key) =>
  crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary")
    .digest("base64");
