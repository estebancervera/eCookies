var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const Order = require("./order");

var userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email:  {
        type: String,
        required: true
    },
    password:  {
        type: String,
        required: true
    },
    orders: [{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: "Post"}],
    phone:  {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }




});


module.exports = mongoose.model("User", userSchema);