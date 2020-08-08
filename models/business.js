var mongoose = require("mongoose");
const Category = require("./category");
    


var businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
	image: {
        type: String,
        required: true
    },
	categories: [{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: "Category"}],
	available:{
        type: Boolean,
        required: true
    },
    lon:{
        type: Number,
        required: true
    },
    lat:{
        type: Number,
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manager"
    }

});

businessSchema.pre('remove', function(next) {
    // 'this' is the client being removed. Provide callbacks here if you want
    // to be notified of the calls' result.w
    
    Category.remove({business: this._id}).exec();
   
    next();
});

module.exports = mongoose.model("Business", businessSchema);