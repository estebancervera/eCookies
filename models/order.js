var mongoose = require("mongoose");
const Packet = require("./packet");



var orderSchema = new mongoose.Schema({
	orderDate: {
        type: Date,
        default: Date.now
    },
	packets: {
		type: [Packet.schema],
		required: true
	},
	deliveryDate: {
        type: Date,
        required: true
    }
	

});

module.exports = mongoose.model("Order", orderSchema);