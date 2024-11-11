require('dotenv').config();
const express = require("express");
const http = require("http"); // Required to integrate socket.io with express
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app); // Create server with http and express
const io = socketIo(server); // Initialize socket.io with the server

const usersRouter = require("./routes/usersRouter");
const itemsRouter = require("./routes/itemsRouter");
const indexRouter = require("./routes/indexRouter");
const cookieParser = require("cookie-parser");
const path = require("path");
const expressSession = require("express-session");



const Chat = require("./models/chat_model"); // Import chat model

// Middleware for parsing JSON, urlencoded data, and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
    expressSession({
        secret: process.env.EXPRESS_SESSION_SECRET || "default_secret", // Default secret for development
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // Set to true if using HTTPS
    })
);

// Static files and view engine
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Routes
app.use("/users", usersRouter);
app.use("/items", itemsRouter);
app.use("/", indexRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// Socket.IO event listeners
io.on('connection', (socket) => {
    console.log('A user connected');

    // Join chat room for a specific item
    socket.on('joinChat', async ({ itemId, userId }) => {
        socket.join(itemId); // Join room with itemId

        // Send chat history to user upon joining
        const chat = await Chat.findOne({ itemId });
        if (chat) {
            socket.emit('chatHistory', chat.messages); // Send existing messages to user
        }
    });

    // Receive message from user
    socket.on('sendMessage', async ({ itemId, sender, message }) => {
        // Save the message in the database
        const chat = await Chat.findOneAndUpdate(
            { itemId },
            {
                $push: { messages: { sender, message, timestamp: new Date() } },
                $setOnInsert: { itemId, users: [sender] }
            },
            { new: true, upsert: true }
        );

        // Broadcast the message to all users in the room
        io.to(itemId).emit('receiveMessage', { sender, message, timestamp: new Date() });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});



// Start server
server.listen(process.env.port, () => {
    console.log("Server is running on port 3000");
});
