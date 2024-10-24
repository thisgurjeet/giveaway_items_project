// authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user_model");

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ email: user.email, userid: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register user
const registerUser = async (req, res) => {
    let { email, username, fullname, password } = req.body;
    const profile_image = req.file ? req.file.buffer.toString("base64") : null;

    try {
        // Check if user already exists
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).send("User already registered");
        }

        // Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = await userModel.create({
            username,
            email,
            fullname,
            password: hashedPassword,
            profile_image,
        });

        // Generate JWT Token
        const token = generateToken(user);
        res.cookie("token", token, { httpOnly: true });

        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred during registration");
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        // Find user by email
        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send("Email or Password Incorrect");
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Email or Password Incorrect");
        }

        // Generate JWT Token
        const token = generateToken(user);
        res.cookie("token", token, { httpOnly: true });

        res.status(200).send("User logged in successfully");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

// Logout user
const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.status(200).send("User logged out successfully");
};

// Exporting the functions
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};
