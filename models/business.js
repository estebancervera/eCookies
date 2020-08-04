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
    image: {
        type: String,
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

module.exports = mongoose.model("Business", businessSchema);