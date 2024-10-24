const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
   name: { type: String, required: true },
   image: { type: String, required: true }, // URL of the item's image
   description: { type: String }, // Brief description of the item
   purchasedDate: {type: Date},
   isClaimed: { type: Boolean, default: false },
   condition: {
       type: String,
       enum: ['excellent', 'good', 'average', 'bad'], // Enum for condition quality
       required: true
   },
   category: {
       type: String,
       enum: ['electronics', 'furniture', 'clothing', 'books', 'other'], // Enum for categories
       required: true
   },
   user: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // Reference to the user who added the item

}, {
   timestamps: true 
});

module.exports = mongoose.model("Items", itemSchema);
