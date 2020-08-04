var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var managerSchema = new mongoose.Schema({
    email:  {
        type: String,
        required: true
    },
    password:  {
        type: String,
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business"
    }


});

module.exports = mongoose.model("Manager", managerSchema);
