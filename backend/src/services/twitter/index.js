const fetch = require("node-fetch");

const { twitterBearerToken } = require("../../config/index");
const { Tweet, TwitterUser } = require("./models/index");

// api rate limit is 900/15 min
const USER_TWEET_TIMELINE_QUERY_INTERVAL = 5000;

const getLatestTweet = () => {
  return Tweet.findOne({}, {}, { sort: { id: -1 } }).exec();
};

const getFirstLoadData = async () => {
  const tweets = await _getRecentTweets();
  const users = await _getUsers();

  return { tweets, users };
};

const pollAndBroadcast = (state, broadcast) => {
  return setInterval(async () => {
    const latestTweetId = state.get("latestTweetId");
    try {
      const rawResponse = await _fetchNewTweets(latestTweetId);
      const text = await rawResponse.text();
      console.log(text);
      const response = JSON.parse(text);

      if (response.data) {
        state.set("latestTweetId", response.meta.newest_id);
        broadcast(JSON.stringify({ tweets: response.data }));
        _insertTweets(response.data);
      }
      if (response.includes && response.includes.users) {
        broadcast(JSON.stringify({ users: response.includes.users }));
        response.includes.users.forEach(_updateUser);
      }
    } catch (err) {}
  }, USER_TWEET_TIMELINE_QUERY_INTERVAL);
};

const _fetchNewTweets = (latestTweetId) => {
  return fetch(
    `https://api.twitter.com/2/users/44196397/tweets${_buildParams(
      latestTweetId,
    )}`,
    _queryTweetsOptions,
  );
};

const _insertTweets = (obj) => {
  Tweet.insertMany(obj)
    .then(() => {
      console.log(`Inserted ${obj.length} new Tweet(s): `);
    })
    .catch((err) => {
      console.error("Error inserting new tweets.");
      console.error(err);
    });
};

const _updateUser = (user) => {
  TwitterUser.findOneAndUpdate({ id: user.id }, user, { upsert: true }).exec(
    (err, user) => {
      if (err) {
        console.error("Error inserting new User");
        console.error(err);
      }
      console.log("Updated user: ", user.id);
    },
  );
};

const _getRecentTweets = () => {
  return Tweet.find().sort({ created_at: -1 }).limit(100).exec();
};

const _getUsers = () => {
  return TwitterUser.find().limit(10).exec();
};

const _queryTweetsOptions = {
  headers: {
    Authorization: `Bearer ${twitterBearerToken}`,
  },
};

const _buildParams = (latestTweetId) => {
  const params = (latestTweetId) => ({
    "user.fields": ["profile_image_url", "verified"],
    "tweet.fields": ["created_at"],
    max_results: 100,
    expansions: "author_id",
    exclude: "replies",
    since_id: latestTweetId,
  });

  return Object.entries(params(latestTweetId)).reduce(
    (res, [prop, value], idx) => {
      if (idx !== 0) {
        res += "&";
      }
      res += prop;
      res += "=";
      Array.isArray(value) ? (res += value.join()) : (res += value);

      return res;
    },
    "?",
  );
};

module.exports = {
  getLatestTweet,
  getFirstLoadData,
  pollAndBroadcast,
};
