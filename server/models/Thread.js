const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
    type: { type: String, enum: ['dm', 'project'], required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For DM
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // For Project chat
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Thread', ThreadSchema);
