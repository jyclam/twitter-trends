const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 8, (err, hash) => {
    if (err) return next(err);

    this.password = hash;
    next();
  });
});

userSchema.methods.checkPassword = function (password) {
  const passwordHash = this.password;

  return new Promise((res, rej) =>
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) return rej(err);

      res(same);
    }),
  );
};

exports.User = mongoose.model("User", userSchema);
