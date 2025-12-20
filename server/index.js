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

// Startup Checks
console.log('--- Server Startup ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI defined:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET defined:', !!process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) console.error('CRITICAL: JWT_SECRET is missing!');
console.log('----------------------');

// Database Connection
const connectDB = require('./config/db');

// Connect to DB immediately
connectDB().catch(err => {
    console.error("Initial database connection failed:", err);
});

// Optional: Middleware to ensure DB is connected ONLY for /api routes
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed for API request:", error);
        res.status(500).json({ msg: `Database connection failed` });
    }
});

// Routes (Placeholders for now)
// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../')));

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
