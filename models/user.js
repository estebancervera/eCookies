var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const Order = require("./order");

var userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    orders: [Order.schema],
    phone: String,




});

//userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);