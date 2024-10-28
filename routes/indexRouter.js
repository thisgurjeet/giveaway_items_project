const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const multer = require("multer");
const path = require("path");
const indexController = require("../controllers/indexController");

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/item_images'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Routes
router.post("/uploadItem", authenticate, upload.single('image'), indexController.uploadItem);
router.post("/claimItem", authenticate, indexController.claimItem);
router.delete("/deleteItem/:id", authenticate, indexController.deleteItem);
router.post("/redeemGiftCard", authenticate, indexController.redeemGiftCard);
router.get("/myGiftCards", authenticate, indexController.getGiftCards);

module.exports = router;
