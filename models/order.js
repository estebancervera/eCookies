var mongoose = require("mongoose");
const Packet = require("./packet");



var orderSchema = new mongoose.Schema({
	orderDate: Date,
	packets: [Packet.schema],
	deliveryDate: Date,	
	

});

module.exports = mongoose.model("Order", orderSchema);