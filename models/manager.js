var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const Category = require("./category");

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
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    accessLevel: {
        type: String,
        default: "manager"
    }


});


managerSchema.plugin(passportLocalMongoose)


module.exports = mongoose.model("Manager", managerSchema);
