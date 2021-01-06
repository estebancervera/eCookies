var mongoose = require("mongoose");

var tokenSchema = new mongoose.Schema({
  deviceToken: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Token", tokenSchema);
