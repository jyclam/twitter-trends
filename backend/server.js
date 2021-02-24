require("dotenv").config();
const http = require("http");
const https = require("https");
const WebSocket = require("ws");
const crypto = require("crypto");
const mongoose = require("mongoose");

const { connect, saveToDb } = require("./db");
const { Tweet, TwitterUser, User } = require("./schema/index");

const PORT = 5000;
// api rate limit is 900/15 min
const USER_TWEET_TIMELINE_QUERY_INTERVAL = 5000;

const state = new Map();

const start = async () => {
  try {
    await connect("mongodb://localhost:27017/twitter-trends");

    mongoose.connection.once("open", () => {
      console.log("db connected!");
    });

    Tweet.findOne({}, {}, { sort: { id: -1 } }, (err, doc) => {
      doc
        ? state.set("latestTweetId", doc.id)
        : state.set("latestTweetId", "1357231313376456708"); // first elon tweet regarding doge
      console.log("latest tweet id: ", state.get("latestTweetId"));
    });
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

    // query db and sedn to client on every ws connection
    // setup cache once data layer becomes more complex
    Tweet.find()
      .sort({ created_at: -1 })
      .limit(100)
      .exec((err, tweets) => {
        if (err) {
          console.error("Error querying for Tweets.");
          console.error(err);
        }
        console.log(`Sending ${tweets.length} tweets to ${clientAddress}`);
        ws.send(JSON.stringify({ tweets }));
      });

    TwitterUser.find()
      .limit(10)
      .exec((err, users) => {
        if (err) {
          console.error("Error querying for TwitterUsers.");
          console.error(err);
        }
        console.log(`Sending ${users.length} users to ${clientAddress}`);
        ws.send(JSON.stringify({ users }));
      });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });

  // poll twitter for new posts
  setInterval(() => {
    https
      .get(getOptions(), (resp) => handleResponse(wss, resp))
      .on("error", (err) => console.error(err));
  }, USER_TWEET_TIMELINE_QUERY_INTERVAL);
};

start();

const getOptions = () => ({
  hostname: "api.twitter.com",
  port: 443,
  path: `/2/users/44196397/tweets?user.fields=profile_image_url,verified&tweet.fields=created_at&max_results=100&expansions=author_id&exclude=replies&since_id=${state.get(
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
      broadcastToAll(wss, JSON.stringify({ tweets: response.data }));
      saveToDb(response.data);
    }

    if (response.includes && response.includes.users) {
      broadcastToAll(wss, JSON.stringify({ users: response.includes.users }));
      response.includes.users.forEach((user) => {
        TwitterUser.findOneAndUpdate(
          { id: user.id },
          user,
          { upsert: true },
          (err, doc) => {
            if (err) {
              console.error("Error inserting new User");
              console.error(err);
            }
            console.log("Updated user:");
            console.log(doc);
          },
        );
      });
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
