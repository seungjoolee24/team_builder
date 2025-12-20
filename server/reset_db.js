const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

// Import all models
const User = require('./models/User');
const Profile = require('./models/Profile');
const Project = require('./models/Project');
const Notification = require('./models/Notification');
const FriendRequest = require('./models/FriendRequest');
const Friendship = require('./models/Friendship');
const Invitation = require('./models/Invitation');
const Chat = require('./models/Chat');
const Thread = require('./models/Thread');
const Message = require('./models/Message');

const resetDB = async () => {
    try {
        await connectDB();
        console.log('Connected to DB. Clearing data...');

        // Clear all collections
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Project.deleteMany({});
        await Notification.deleteMany({});
        await FriendRequest.deleteMany({});
        await Friendship.deleteMany({});
        await Invitation.deleteMany({});
        await Chat.deleteMany({});
        await Thread.deleteMany({});
        await Message.deleteMany({});

        console.log('All data has been cleared.');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing data:', err);
        process.exit(1);
    }
};

resetDB();
