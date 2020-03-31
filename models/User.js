const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secretOrKey = require("../config/keys").secretOrKey;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 32
  },
  books: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }]
});

UserSchema.statics.login = async function (username, password) {
  const User = this;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    user.token = "Bearer " + jwt.sign({ _id: user._id }, secretOrKey);
    user.loggedIn = true;
    return user;
  }
  return null;
};

module.exports = mongoose.model('User', UserSchema);