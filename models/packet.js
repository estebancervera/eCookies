var mongoose = require("mongoose");
const Product = require("./product");
    


var packetSchema = new mongoose.Schema({
    quantity: Number,
    products: [Product.schema]
});

module.exports = mongoose.model("Packet", packetSchema);