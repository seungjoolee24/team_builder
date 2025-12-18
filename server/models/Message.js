const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
