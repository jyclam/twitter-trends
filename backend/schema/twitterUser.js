const mongoose = require("mongoose");

const twitterUserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  profile_image_url: String,

  username: String,
  verified: Boolean,
  name: String,
});

exports.TwitterUser = mongoose.model("TwitterUser", twitterUserSchema);
