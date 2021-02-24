const mongoose = require("mongoose");
const { Tweet, TwitterUser, User } = require("./schema/index");

exports.connect = (url, opts = {}) => {
  return mongoose.connect(url, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

exports.saveToDb = (obj) => {
  if (Array.isArray(obj)) {
    return Tweet.insertMany(obj)
      .then(() => {
        console.log("New tweets inserted: ", obj);
      })
      .catch((err) => {
        console.error("Error inserting new tweets.");
        console.error(err);
      });
  }

  const doc = new Tweet({
    author_id: obj.author_id,
    id: obj.id,
    text: obj.text,
  });

  return doc.save((err, result) => {
    if (err) {
      console.error("Error inserting new tweet.");
      console.error(err);
    } else {
      console.log("New Tweet inserted: ", result);
    }
  });
};
