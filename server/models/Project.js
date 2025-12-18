const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    oneLineDescription: { type: String },
    description: { type: String },
    type: { type: String }, // Class, Side, etc.
    domain: { type: String }, // Web, AI, etc.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'OPEN' }, // OPEN, IN_PROGRESS, COMPLETED

    // Roles Requirements
    roles: [{
        role: String,
        count: Number,
        filled: { type: Number, default: 0 }
    }],

    // Members (Accepted)
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String,
        joinedAt: { type: Date, default: Date.now }
    }],

    // Applications (Pending)
    applications: [{
        applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String,
        message: String,
        status: { type: String, default: 'PENDING' }, // PENDING, ACCEPTED, REJECTED
        appliedAt: { type: Date, default: Date.now }
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
