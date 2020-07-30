var mongoose = require("mongoose");


var productSchema = new mongoose.Schema({
	name: {
        type: String,
        required: true
    },
	description: {
        type: String,
        required: true
    },
	price:{
        type: Number,
        required: true
    },
	available:{
        type: Boolean,
        required: true
    },
	image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Product", productSchema);