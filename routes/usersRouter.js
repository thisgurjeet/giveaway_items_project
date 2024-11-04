const express = require("express");
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const multer = require("multer");
const cookieParser = require("cookie-parser");
const {
    registerUser,
    loginUser,
    logoutUser,
} = require("../controllers/authController"); // Adjust the path if needed

const { userProfile } = require("../controllers/profileController")

require("dotenv").config(); // For storing JWT_SECRET in the .env file

// Middleware for cookie parsing
router.use(cookieParser());

// Configure multer for file uploads (profile image)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Base URL
router.get("/", (req, res) => {
    res.send("Register Screen");
});

// Register user
router.post("/register", upload.single("profile_image"), registerUser);

// Login user
router.post("/login", loginUser);

// Logout user
router.post("/logout", logoutUser);

// profile route of user
router.get('/profile', authenticate, userProfile);


module.exports = router;
