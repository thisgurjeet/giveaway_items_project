const User = require('../models/user_model'); // Ensure correct path to your User model
const Item = require('../models/item_model'); // Ensure correct path to your Item model

// User Profile Route
const userProfile = async (req, res) => {
    try {
        // Fetch the user from the database using the authenticated user's ID (req.user._id)
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the number of items uploaded by the user
        const itemsUploadedCount = await Item.countDocuments({ user: req.user._id });

        // Fetch the number of items claimed by the user
        const itemsClaimedCount = user.claimedList ? user.claimedList.length : 0;

        // Respond with user profile details
        res.status(200).json({
            name: user.name,
            username: user.username,
            profileImage: user.profile_image,
            pointsEarned: user.pointsEarned || 0,
            itemsClaimed: itemsClaimedCount,
            itemsUploaded: itemsUploadedCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = { userProfile };
