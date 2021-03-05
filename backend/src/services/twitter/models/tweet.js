const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
  author_id: String,
  id: {
    type: String,
    required: true,
    unique: true,
  },
  created_at: Date,
  text: String,
});

exports.Tweet = mongoose.model("Tweet", tweetSchema);
