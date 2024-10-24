const mongoose = require("mongoose");


const chatSchema = new mongoose.Schema({
    itemId: { type: String, required: true }, // ID of the item associated with the chat
    users: [String], // Array of user IDs participating in the chat
    messages: [
        {
            sender: String, // User ID of the sender
            message: String, // Message text
            timestamp: { type: Date, default: Date.now } // Timestamp of the message
        }
    ]
});


module.exports = mongoose.model("Chat", chatSchema);


