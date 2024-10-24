const express = require('express');
const router = express.Router();
const Item = require('../models/item_model'); // Ensure the correct path to your item model
const authenticate = require("../middlewares/authenticate"); 

// List of all items posted
router.get("/", async (req, res) => {
    try {
        // Fetch all items from the database
        const items = await Item.find(); // Use your Item model to find all items
        res.status(200).json(items); // Send the items as a JSON response
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// Get details of a specific item by ID
router.get("/:id", async (req, res) => {
    try {
        const itemId = req.params.id; // Get the item ID from the request params
        const item = await Item.findById(itemId); // Find the item by ID
        
        if (!item) {
            return res.status(404).send("Item not found"); // Return 404 if item doesn't exist
        }
        
        res.status(200).json(item); // Send the item details as JSON
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// route to show claimed items 
router.get("/claimedItems", authenticate, async (req, res) => {
    try {
        // Find the authenticated user
        const user = await User.findById(req.user._id).populate('claimedList');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get the list of claimed items (populated from the claimedList array)
        const claimedItems = user.claimedList;

        // If there are no claimed items, return an empty array
        if (!claimedItems || claimedItems.length === 0) {
            return res.status(200).json({ message: "No claimed items found", items: [] });
        }

        // Return the claimed items
        res.status(200).json({ items: claimedItems });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// route for search queries 
router.get("/search", async (req, res) => {
    try {
        const { name, category } = req.query; // Get the search and filter parameters from query string

        // Create a dynamic query object
        const query = {};

        // If name is provided, add it to the query with case-insensitive regex search
        if (name) {
            query.name = { $regex: new RegExp(name, 'i') }; // 'i' makes it case-insensitive
        }

        // If category is provided, add it to the query
        if (category) {
            query.category = category;
        }

        // Fetch items that match the query
        const items = await Item.find(query);

        // If no items found, return a message
        if (items.length === 0) {
            return res.status(200).json({ message: "No items found matching your search", items: [] });
        }

        // Return the matching items
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// Route to handle social sharing of items
router.post("/share/:id", async (req, res) => {
    const { userId } = req.body; // Assuming userId is sent in the request body
    const { itemId } = req.params;

    try {
        // Find the user and item
        const user = await User.findById(userId);
        const item = await Item.findById(itemId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Add item to user's shared items
        user.socialSharedItems.push(itemId);

        // Increment user's earned points
        user.pointsEarned += 25;

        // Save the user document
        await user.save();

        res.status(200).json({
            message: "Item shared successfully!",
            pointsEarned: user.pointsEarned,
            sharedItems: user.socialSharedItems,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;
