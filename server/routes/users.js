const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');

// @route   GET api/users
// @desc    Get all users (with profiles)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const profiles = await Profile.find();

        const usersWithProfiles = users.map(user => {
            const profile = profiles.find(p => p.user.toString() === user.id);
            return {
                ...user._doc,
                profile: profile || {}
            };
        });

        res.json(usersWithProfiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users/profile
// @desc    Create or update user profile
// @access  Private
router.post('/profile', auth, async (req, res) => {
    const {
        college,
        major,
        primaryRole,
        skills,
        hashtags,
        bio
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (college) profileFields.college = college;
    if (major) profileFields.major = major;
    if (primaryRole) profileFields.primaryRole = primaryRole;
    if (skills) profileFields.skills = skills;
    if (hashtags) profileFields.hashtags = hashtags;
    if (bio) profileFields.bio = bio;

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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
