const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Friendship = require('../models/Friendship');
const Project = require('../models/Project');

// @route   GET api/users/contacts
// @desc    Get users available for chat (Friends + Project Teammates)
// @access  Private
router.get('/contacts', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const contactIds = new Set();

        // 1. Get Friends
        const friendships = await Friendship.find({ users: currentUserId });
        friendships.forEach(f => {
            f.users.forEach(uid => {
                if (uid.toString() !== currentUserId) contactIds.add(uid.toString());
            });
        });

        // 2. Get Project Teammates
        const projects = await Project.find({
            $or: [{ owner: currentUserId }, { 'members.user': currentUserId }]
        });

        projects.forEach(p => {
            if (p.owner.toString() !== currentUserId) contactIds.add(p.owner.toString());
            p.members.forEach(m => {
                if (m.user.toString() !== currentUserId) contactIds.add(m.user.toString());
            });
        });

        // Fetch User Details
        const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }).select('name email');
        res.json(contacts);
    } catch (err) {
        console.error('Get Contacts Error:', err.message);
        res.status(500).json({ msg: 'Server error fetching contacts' });
    }
});

// @route   GET api/users
// @desc    Get all users (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
    const { college, major, primaryRole } = req.query;

    try {
        // Find users
        const users = await User.find().select('-password');

        // Build Profile Filter
        const profileQuery = {};
        if (college && college !== 'All') profileQuery.college = college;
        if (major && major !== 'All') profileQuery.major = new RegExp(major, 'i');
        if (primaryRole && primaryRole !== 'All') profileQuery.primaryRole = primaryRole;

        const profiles = await Profile.find(profileQuery);

        const usersWithProfiles = users.map(user => {
            const profile = profiles.find(p => p.user.toString() === user.id);
            if (!profile && Object.keys(profileQuery).length > 0) return null; // Filtered out
            return {
                ...user._doc,
                profile: profile || {}
            };
        }).filter(u => u !== null);

        res.json(usersWithProfiles);
    } catch (err) {
        console.error('Get Users Error:', err.message);
        res.status(500).json({ msg: 'Server error fetching users' });
    }
});

// @route   GET api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile);
    } catch (err) {
        console.error('Get Profile Error:', err.message);
        res.status(500).json({ msg: 'Server error fetching profile' });
    }
});

// @route   POST api/users/profile
// @desc    Create or update user profile
// @access  Private
router.post('/profile', auth, async (req, res) => {
    const {
        college,
        major,
        bio,
        hashtags,
        primaryRole,
        otherRoles,
        skills,
        links,
        interestDomains,
        preferredProjectTypes,
        topicTags,
        collaboration,
        goals
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    // Direct fields
    if (college) profileFields.college = college;
    if (major) profileFields.major = major;
    if (bio) profileFields.bio = bio;
    if (hashtags) profileFields.hashtags = hashtags;
    if (primaryRole) profileFields.primaryRole = primaryRole;
    if (otherRoles) profileFields.otherRoles = otherRoles;
    if (skills) profileFields.skills = skills;
    if (interestDomains) profileFields.interestDomains = interestDomains;
    if (preferredProjectTypes) profileFields.preferredProjectTypes = preferredProjectTypes;
    if (topicTags) profileFields.topicTags = topicTags;

    // Nested objects
    if (links) profileFields.links = links;
    if (collaboration) profileFields.collaboration = collaboration;
    if (goals) profileFields.goals = goals;

    profileFields.updatedAt = Date.now();

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error('Update Profile Error:', err.message);
        res.status(500).json({ msg: 'Server error updating profile' });
    }
});

module.exports = router;
