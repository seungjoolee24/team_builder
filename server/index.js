const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = require('./config/db');

// Connect to DB immediately (Async)
connectDB();

// 1. Serve Static Files IMMEDIATELY (No DB dependency)
app.use(express.static(path.join(__dirname, '../')));

// 2. Middleware to ensure DB is connected for API routes
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ msg: `Database connection failed: ${error.message}` });
    }
});

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chats');
const invitationRoutes = require('./routes/invitations');
const friendRoutes = require('./routes/friends');
const inboxRoutes = require('./routes/inbox');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/inbox', inboxRoutes);

// Start Server (Only if not running on Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
