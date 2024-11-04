const Item = require('../models/item_model'); // Adjust path as needed
const User = require('../models/user_model'); // Adjust path if necessary

// Fetch all items
const getAllItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// Get item details by ID
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).send("Item not found");
        }
        res.status(200).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


// Get claimed items for authenticated user
const getClaimedItems = async (req, res) => { 
    try {
        console.log("Fetching claimed items for user:", req.user._id);

        // Fetch the user and populate the claimedList field to get the actual items
        const user = await User.findById(req.user._id).populate('claimedList');

        // Check if claimedList has any items
        if (!user || !user.claimedList.length) {
            return res.status(404).json({ message: 'No claimed items found for this user' });
        }

        // Return the claimed items
        res.status(200).json(user.claimedList);
    } catch (err) {
        console.error("Error in getClaimedItems:", err);
        res.status(500).send("Server Error");
    }
};


const searchItems = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    const trimmedQuery = query.trim(); // Trim the query
    console.log(`Searching for items with name matching: ${trimmedQuery}`); // Log the query

    try {
        const items = await Item.find({ name: { $regex: trimmedQuery, $options: 'i' } });
        console.log("Found items:", items); // Log found items
        res.status(200).json(items);
    } catch (error) {
        console.error("Error searching items:", error);
        res.status(500).json({ message: error.message });
    }
};




// Social sharing of items
const shareItem = async (req, res) => {
    const { userId } = req.body;
    const { id: itemId } = req.params;

    try {
        const user = await User.findById(userId);
        const item = await Item.findById(itemId);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (!item) return res.status(404).json({ message: "Item not found" });

        user.socialSharedItems.push(itemId);
        user.pointsEarned += 25;

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
};

module.exports = {
    getAllItems,
    getItemById,
    getClaimedItems,
    searchItems,
    shareItem,
};
