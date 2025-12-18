const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    college: { type: String },
    major: { type: String },
    primaryRole: { type: String },
    skills: { type: String }, // Comma separated string for simplicity or Array
    hashtags: { type: String },
    bio: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', ProfileSchema);
