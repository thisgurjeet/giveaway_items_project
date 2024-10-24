const express = require("express");
const router = express.Router();
const Item = require("../models/item_model");
const User = require("../models/user_model"); // Import the User model
const authenticate = require("../middlewares/authenticate"); // Assuming you have auth middleware
const multer = require("multer");
const path = require("path");
const sendEmail = require("../utils/emailService");


// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/item_images'); // Directory to save the files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Rename the file
    }
});

const upload = multer({ storage: storage });

// Function to calculate points based on item condition
const calculatePoints = (condition) => {
    switch (condition) {
        case 'excellent':
            return 100;
        case 'good':
            return 75;
        case 'average':
            return 50;
        case 'bad':
            return 25;
        default:
            return 0;
    }
};

// Upload item route
router.post("/uploadItem", authenticate, upload.single('image'), async (req, res) => {
    try {
        const { name, description, purchasedDate, condition, category } = req.body;
        const image = req.file ? `/item_images/${req.file.filename}` : null;

        // Create a new item
        const newItem = await Item.create({
            name,
            description,
            purchasedDate,
            condition,
            category,
            image,
            user: req.user._id, // Assuming `authenticate` sets req.user
        });

        // Calculate points based on the condition of the item
        const points = calculatePoints(condition);

        // Find the user and update their pointsEarned field
        const user = await User.findById(req.user._id);
        if (user) {
            user.pointsEarned = (user.pointsEarned || 0) + points; // Add the points
            await user.save(); // Save the updated user
        }

        res.status(201).json({ 
            message: "Item uploaded successfully", 
            item: newItem,
            pointsEarned: user.pointsEarned, // Return updated points
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// Claim item route
router.post("/claimItem", authenticate, async (req, res) => {
    try {
        const { itemId } = req.body; // Get the item ID from the request body

        // Find the item by ID
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Check if the item is already claimed
        if (item.isClaimed) {
            return res.status(400).json({ message: "Item has already been claimed" });
        }

        // Update the item to mark it as claimed
        item.isClaimed = true;
        await item.save(); // Save the updated item

        // Find the user who is claiming the item
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add the item to the user's claimedList
        user.claimedList.push(item._id);

        // Calculate points based on the item's condition and add to user's pointsEarned
        const points = calculatePoints(item.condition);
        user.pointsEarned = (user.pointsEarned || 0) + points;

        // Save the updated user
        await user.save();

        res.status(200).json({
            message: "Item claimed successfully",
            claimedItem: item,
            pointsEarned: user.pointsEarned, // Return updated points
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// Delete item route uploaded by the user
router.delete("/deleteItem/:id", authenticate, async (req, res) => {
    try {
        const itemId = req.params.id; // Get the item ID from request params

        // Find the item by ID
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Check if the logged-in user is the one who uploaded the item
        if (item.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this item" });
        }

        // Delete the item from the database
        await Item.findByIdAndDelete(itemId);

        // Remove the item from the user's postedItems array (if applicable)
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { postedItems: itemId } // Remove the item from the user's posted items list
        });

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});



// Mock function to generate a gift card code (in a real app, integrate with Amazon API or generate a code)
const generateGiftCardCode = () => {
    return 'AMAZON-' + Math.random().toString(36).substring(2, 12).toUpperCase();
};


// Route to redeem points for a gift card
router.post("/redeemGiftCard", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const requiredPoints = 500; // Points required to redeem Rs. 500 gift card

        // Check if user has enough points
        if (user.pointsEarned < requiredPoints) {
            return res.status(400).json({ message: "You do not have enough points to redeem a gift card." });
        }

        // Deduct points from user's balance
        user.pointsEarned -= requiredPoints;

        // Generate gift card code
        const giftCardCode = generateGiftCardCode();

        // Add gift card to user's redeemed giftCards array
        user.giftCards.push({
            type: 'amazon', // Assuming we're doing Amazon gift cards
            value: 500,
            code: giftCardCode
        });

        // Save updated user info
        await user.save();

        // Send email notification
        const emailSubject = "Your Amazon Rs. 500 Gift Card";
        const emailText = `Hi ${user.fullname},\n\nCongratulations! You've successfully redeemed your Rs. 500 Amazon gift card. Here is your gift card code:\n\n${giftCardCode}\n\nEnjoy shopping!`;
        const emailHtml = `
            <h2>Hi ${user.fullname},</h2>
            <p>Congratulations! You've successfully redeemed your Rs. 500 Amazon gift card. Here is your gift card code:</p>
            <p style="font-size: 20px; font-weight: bold;">${giftCardCode}</p>
            <p>Enjoy shopping!</p>
        `;

        await sendEmail(user.email, emailSubject, emailText, emailHtml);

        // Send response with the gift card code
        res.status(200).json({
            message: "Gift card redeemed successfully! Check your email for the code.",
            giftCard: {
                type: 'Amazon',
                value: 500,
                code: giftCardCode
            },
            pointsRemaining: user.pointsEarned
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});


// Route to get all redeemed gift cards for a user
router.get("/myGiftCards", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Return the user's redeemed gift cards
        res.status(200).json({
            giftCards: user.giftCards
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});



module.exports = router;
