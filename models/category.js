var mongoose = require("mongoose");
const Product = require("./product");
    


var categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
	image: {
        type: String,
        required: true
    },
	products: [{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: "Product"}],
	qtyRestricted:{
        type: Boolean,
        required: true
    },
	packageSizes: {
        type: [Number]
    },
    timeRequired: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Category", categorySchema);