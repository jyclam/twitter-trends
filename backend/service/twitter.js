const { Tweet, TwitterUser } = require("../schema/index");

// api rate limit is 900/15 min
const USER_TWEET_TIMELINE_QUERY_INTERVAL = 5000;

const handleResponse = (wss, resp, setState) => {
  let data = "";

  resp.on("data", (chunk) => {
    data += chunk;
  });

  resp.on("end", () => {
    let response;
    try {
      response = JSON.parse(data);
    } catch (err) {
      console.error("Response not valid JSON: ", data);
      console.error(err);
    }

    if (response.data) {
      setState("latestTweetId", response.meta.newest_id);
      broadcastToAll(wss, JSON.stringify({ tweets: response.data }));
      insertTweets(response.data);
    }

    if (response.includes && response.includes.users) {
      broadcastToAll(wss, JSON.stringify({ users: response.includes.users }));
      response.includes.users.forEach(updateUser);
    }
  });
};

const broadcastToAll = (wss, msg) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === client.OPEN) {
      client.send(msg);
    }
  });
};

const insertTweets = (obj) => {
  Tweet.insertMany(obj)
    .then(() => {
      console.log("New tweets inserted: ", obj);
    })
    .catch((err) => {
      console.error("Error inserting new tweets.");
      console.error(err);
    });
};

const updateUser = (user) => {
  TwitterUser.findOneAndUpdate({ id: user.id }, user, { upsert: true }).exec(
    (err, user) => {
      if (err) {
        console.error("Error inserting new User");
        console.error(err);
      }
      console.log("Updated user:");
      console.log(user);
    },
  );
};

const getLatestTweet = () => {
  return Tweet.findOne({}, {}, { sort: { id: -1 } }).exec();
};

const getRecentTweets = () => {
  return Tweet.find().sort({ created_at: -1 }).limit(100).exec();
};

const getUsers = () => {
  return TwitterUser.find().limit(10).exec();
};

const queryTweetsOptions = (latestTweetId) => ({
  hostname: "api.twitter.com",
  port: 443,
  path: `/2/users/44196397/tweets${buildParams(params(latestTweetId))}`,
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});

const params = (latestTweetId) => ({
  "user.fields": ["profile_image_url", "verified"],
  "tweet.fields": ["created_at"],
  max_results: 100,
  expansions: "author_id",
  exclude: "replies",
  since_id: latestTweetId,
});

const buildParams = (params) => {
  return Object.entries(params).reduce((res, [prop, value], idx) => {
    if (idx !== 0) {
      res += "&";
    }
    res += prop;
    res += "=";
    Array.isArray(value) ? (res += value.join()) : (res += value);

    return res;
  }, "?");
};

module.exports = {
  queryTweetsOptions,
  handleResponse,
  getLatestTweet,
  getRecentTweets,
  getUsers,
  USER_TWEET_TIMELINE_QUERY_INTERVAL,
};
