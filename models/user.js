var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const Order = require("./order");

var userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  phone: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
  },
});

module.exports = mongoose.model("User", userSchema);
