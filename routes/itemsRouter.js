const express = require('express');
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const {
    getAllItems,
    getItemById,
    getClaimedItems,
    searchItems,
    shareItem,
} = require("../controllers/itemController"); // Adjust path if needed

// List of all items posted
router.get("/", getAllItems);

// Route to show claimed items (protected by authentication)
router.get('/claimedItems', authenticate, getClaimedItems);


router.get("/search", authenticate, searchItems);



// Get details of a specific item by ID
router.get("/:id", getItemById);


// Route to handle social sharing of items
router.post("/share/:id", shareItem);


module.exports = router;
