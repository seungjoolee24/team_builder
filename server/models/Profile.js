const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    college: { type: String },
    major: { type: String },
    bio: { type: String },
    hashtags: { type: String }, // Keep for backward compatibility or simple tags

    // Roles & Skills
    primaryRole: { type: String },
    otherRoles: [{ type: String }],
    skills: [{
        category: { type: String },
        name: { type: String },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
        experience: { type: String, enum: ['class-only', 'club-or-contest', 'internship-or-real'] }
    }],

    // Links
    links: {
        github: { type: String },
        portfolio: { type: String },
        youtube: { type: String },
        instagram: { type: String }
    },
    customLinks: [{
        label: { type: String },
        url: { type: String }
    }],

    // Interests & Preferences
    interestDomains: [{ type: String }],
    preferredProjectTypes: [{ type: String }],
    topicTags: [{ type: String }],

    // Collaboration & Availability
    collaboration: {
        weeklyHours: { type: String },
        timeSlots: [{ type: String }],
        duration: { type: String },
        workMode: { type: String },
        preferredPlaces: [{ type: String }],
        style: {
            roleType: { type: String }, // leader, follower, etc.
            traits: [{ type: String }], // traits like "punctual", "creative"
            communication: [{ type: String }] // "slack", "discord", etc.
        }
    },

    // Goals & Motivation
    goals: {
        purposes: [{ type: String }],
        priorities: [{ type: String }], // Array for ranking
        awardPreference: { type: String }
    },

    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', ProfileSchema);
