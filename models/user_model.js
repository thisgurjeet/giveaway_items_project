const mongoose = require('mongoose');
// Connecting to the database
mongoose.connect("mongodb://127.0.0.1:27017/giveaway");


const userSchema = mongoose.Schema({
    fullname: String,
    username: String,
    email: String,
    password: String,
    claimedList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Items",
    }],
    postedItems: {
        type: Array,
        default: [],
    },
    profile_image: {
        type: String,
        default: "profile_default.png"
    },
    socialSharedItems: { 
        type: [String], 
        default: [] 
    },
    pointsEarned: Number,
    giftCards: [
        {
            type: {
                type: String,
                enum: ['amazon', 'flipkart', 'other'], // Add types of gift cards
                required: true,
            },
            value: Number, // Amount of the gift card (e.g., 500)
            code: String, // Code to redeem the gift card
            redeemedAt: { type: Date, default: Date.now } // Date when redeemed
        }
    ]
});

module.exports = mongoose.model('User', userSchema)