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
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business"
    }
});

categorySchema.pre('remove', function(next) {
    // 'this' is the client being removed. Provide callbacks here if you want
    // to be notified of the calls' result.
    Product.remove({category: this._id}).exec();
   
    next();
});

module.exports = mongoose.model("Category", categorySchema);