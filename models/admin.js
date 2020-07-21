var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var adminSchema = new mongoose.Schema({
    email:  {
        type: String,
        required: true
    },
    password:  {
        type: String,
        required: true
    }


});

module.exports = mongoose.model("Admin", adminSchema);