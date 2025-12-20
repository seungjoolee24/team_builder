require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes (Placeholders for now)
// Serve static files from the root directory
const path = require('path');
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
