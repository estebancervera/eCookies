var mongoose = require("mongoose");

const Cookie = require("./cookie");
    


var packetSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    cookies: {
        type: [Cookie.schema],
        required: true
    }
});

module.exports = mongoose.model("Packet", packetSchema);