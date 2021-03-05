const mongoose = require("mongoose");

module.exports = async (url, opts = {}) => {
  const connection = await mongoose.connect(url, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return connection.connection.db;
};
