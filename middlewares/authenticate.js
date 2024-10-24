const jwt = require('jsonwebtoken');
const userModel = require("../models/user_model"); // Ensure the correct path to your user model

const authenticate = async (req, res, next) => {
    const token = req.cookies.token; // find the token (we get if we are logged in)
    
    if (!token) {
        return res.status(401).send("Access Denied");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userid);
        
        if (!user) {
            return res.status(401).send("Access Denied");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(400).send("Invalid Token");
    }
};

module.exports = authenticate;
