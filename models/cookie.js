var mongoose = require("mongoose");
const Product = require("./product");
    


var cookieSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    products: {
        type: Product.schema,
        required: true
    }
});

module.exports = mongoose.model("Cookie", cookieSchema);