var mongoose = require("mongoose");


var productSchema = new mongoose.Schema({
	name: String,
	description: String,
	price: Number,
	available: Boolean
});

module.exports = mongoose.model("Product", productSchema);