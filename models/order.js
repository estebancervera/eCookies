var mongoose = require("mongoose");
const Packet = require("./packet");



var orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User",
        required: true
    },
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
    },
    business: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "Business",
        required: true
    }
	

});

module.exports = mongoose.model("Order", orderSchema);