const Item = require("../models/item_model");
const User = require("../models/user_model");
const sendEmail = require("../utils/emailService");

// Helper functions
const calculatePoints = (condition) => {
    switch (condition) {
        case 'excellent': return 100;
        case 'good': return 75;
        case 'average': return 50;
        case 'bad': return 25;
        default: return 0;
    }
};

const generateGiftCardCode = () => {
    return 'AMAZON-' + Math.random().toString(36).substring(2, 12).toUpperCase();
};

// Controller functions
const uploadItem = async (req, res) => {
    try {
        const { name, description, purchasedDate, condition, category } = req.body;
        const image = req.file ? `/item_images/${req.file.filename}` : null;

        const newItem = await Item.create({
            name, description, purchasedDate, condition, category, image, user: req.user._id
        });

        const points = calculatePoints(condition);
        const user = await User.findById(req.user._id);

        if (user) {
            user.pointsEarned = (user.pointsEarned || 0) + points;
            await user.save();
        }

        res.status(201).json({
            message: "Item uploaded successfully",
            item: newItem,
            pointsEarned: user.pointsEarned,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

const claimItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const item = await Item.findById(itemId);

        if (!item || item.isClaimed) {
            return res.status(404).json({ message: "Item not found or already claimed" });
        }

        item.isClaimed = true;
        await item.save();

        const user = await User.findById(req.user._id);
        user.claimedList.push(item._id);
        user.pointsEarned = (user.pointsEarned || 0) + calculatePoints(item.condition);
        await user.save();

        res.status(200).json({
            message: "Item claimed successfully",
            claimedItem: item,
            pointsEarned: user.pointsEarned,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item || item.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this item" });
        }

        await Item.findByIdAndDelete(itemId);
        await User.findByIdAndUpdate(req.user._id, { $pull: { postedItems: itemId } });

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

const redeemGiftCard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const requiredPoints = 500;

        if (user.pointsEarned < requiredPoints) {
            return res.status(400).json({ message: "Not enough points to redeem a gift card" });
        }

        user.pointsEarned -= requiredPoints;
        const giftCardCode = generateGiftCardCode();

        user.giftCards.push({ type: 'amazon', value: 500, code: giftCardCode });
        await user.save();

        const emailSubject = "Your Amazon Rs. 500 Gift Card";
        const emailText = `Hi ${user.fullname}, here is your gift card code: ${giftCardCode}`;
        const emailHtml = `<h2>Hi ${user.fullname},</h2><p>Your Amazon gift card code: ${giftCardCode}</p>`;
        await sendEmail(user.email, emailSubject, emailText, emailHtml);

        res.status(200).json({
            message: "Gift card redeemed successfully!",
            giftCard: { type: 'Amazon', value: 500, code: giftCardCode },
            pointsRemaining: user.pointsEarned,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

const getGiftCards = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ giftCards: user.giftCards });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    uploadItem,
    claimItem,
    deleteItem,
    redeemGiftCard,
    getGiftCards
};
