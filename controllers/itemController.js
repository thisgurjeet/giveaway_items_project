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
        const user = await User.findById(req.user._id).populate('claimedList');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ items: user.claimedList || [] });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// Search items by name or category
const searchItems = async (req, res) => {
    try {
        const { name, category } = req.query;
        const query = {};

        if (name) {
            query.name = { $regex: new RegExp(name, 'i') };
        }
        if (category) {
            query.category = category;
        }

        const items = await Item.find(query);
        res.status(200).json(items.length ? items : { message: "No items found matching your search", items: [] });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
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
