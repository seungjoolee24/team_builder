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
    const { college, major, primaryRole, tags } = req.query;

    try {
        // Build User Query (Tags)
        const userQuery = {};
        if (tags) {
            const tagList = Array.isArray(tags) ? tags : tags.split(',').filter(t => t.trim());
            if (tagList.length > 0) {
                userQuery.tags = { $all: tagList };
            }
        }

        // Find users matching tags
        const users = await User.find(userQuery).select('-password');

        // Build Profile Filter
        const profileQuery = {};
        if (college && college !== 'All') profileQuery.college = college;
        if (major && major !== 'All') profileQuery.major = new RegExp(major, 'i');
        if (primaryRole && primaryRole !== 'All') profileQuery.primaryRole = primaryRole;

        const profiles = await Profile.find(profileQuery);

        const usersWithProfiles = users.map(user => {
            const profile = profiles.find(p => p.user.toString() === user.id);
            if (!profile && Object.keys(profileQuery).length > 0) return null; // Filtered out by profile stats

            // If no profile but user matched tags, we still return user (unless profile query was active)
            // But requirement says: "user must satisfy the existing search filters AND the tag filter."
            // Existing filters (college/major) depend on Profile.
            // So if Profile doesn't match, we drop.

            return {
                ...user._doc, // Includes tags
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
        const user = await User.findById(req.user.id).select('tags');

        if (!profile) {
            // Even if no profile, we should return empty structure with tags if possible, 
            // but standard behavior is 400 or empty. 
            // Let's return minimal object if profile missing but user exists? 
            // The frontend logic checks 'if (profile)'. 
            // Better to return 400 as before or empty JSON.
            // Keeping original behavior but extracting tags if profile exists.
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        // Merge tags into response
        const responseProxy = { ...profile._doc, tags: user ? user.tags : [] };
        res.json(responseProxy);
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
        college, major, bio, hashtags, primaryRole, otherRoles,
        skills, links, customLinks,
        // The following are now 'tags' in UI but kept in Profile for legacy? 
        // Prompt says: "Category info (interest/preference/etc.) may remain UI-only. Minimum requirement is a unified tags array."
        // And "Convert only these six sections into a Tag-based system".
        // It implies we might not need to store them in Profile anymore if they are all in User.tags.
        // However, keeping them in Profile won't hurt, but the prompt says: "Store in the User model as: tags: string[]"
        // I will extract 'tags' from body and save to User.
        tags,
        // I will still allow saving other fields if sent, but Profile Edit will mainly send 'tags'.
        interestDomains, preferredProjectTypes, topicTags, collaboration, goals
    } = req.body;

    // Save Tags to User Model
    if (tags) {
        try {
            await User.findByIdAndUpdate(req.user.id, { tags: tags });
        } catch (err) {
            console.error('Error updating user tags:', err);
        }
    }

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    if (college) profileFields.college = college;
    if (major) profileFields.major = major;
    if (bio) profileFields.bio = bio;
    if (hashtags) profileFields.hashtags = hashtags;
    if (primaryRole) profileFields.primaryRole = primaryRole;
    if (otherRoles) profileFields.otherRoles = otherRoles;
    if (skills) profileFields.skills = skills;
    if (links) profileFields.links = links;
    if (customLinks) profileFields.customLinks = customLinks;

    // Optional fields - if still sent, we save them. If not, we don't.
    // The new frontend might not send them, effectively 'deprecating' them in Profile.
    if (interestDomains) profileFields.interestDomains = interestDomains;
    if (preferredProjectTypes) profileFields.preferredProjectTypes = preferredProjectTypes;
    if (topicTags) profileFields.topicTags = topicTags;
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
            // Return profile + tags
            const user = await User.findById(req.user.id).select('tags');
            return res.json({ ...profile._doc, tags: user ? user.tags : [] });
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();

        const user = await User.findById(req.user.id).select('tags');
        res.json({ ...profile._doc, tags: user ? user.tags : [] });
    } catch (err) {
        console.error('Update Profile Error:', err.message);
        res.status(500).json({ msg: 'Server error: ' + err.message });
    }
});

module.exports = router;
