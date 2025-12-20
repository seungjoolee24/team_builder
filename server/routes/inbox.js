const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Thread = require('../models/Thread');
const Message = require('../models/Message');
const Project = require('../models/Project');
const Friendship = require('../models/Friendship');

// @route   GET api/inbox
// @desc    Get all conversation threads for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find threads where user is participant or project member
        // For Project chats, we need projects user is member of
        const myProjects = await Project.find({
            $or: [{ owner: req.user.id }, { 'members.user': req.user.id }]
        }).select('_id');
        const projectIds = myProjects.map(p => p._id);

        const threads = await Thread.find({
            $or: [
                { type: 'dm', users: req.user.id },
                { type: 'project', project: { $in: projectIds } }
            ]
        })
            .populate('users', 'name')
            .populate('project', 'title')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });

        res.json(threads);
    } catch (err) {
        console.error('Fetch Inbox Error:', err.message);
        res.status(500).json({ msg: 'Server error fetching inbox' });
    }
});

// @route   GET api/inbox/thread/:id
// @desc    Get messages for a thread
// @access  Private
router.get('/thread/:id', auth, async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ msg: 'Thread not found' });

        // Authorization check
        if (thread.type === 'dm') {
            if (!thread.users.includes(req.user.id)) return res.status(401).json({ msg: 'Not authorized' });
        } else {
            const project = await Project.findById(thread.project);
            if (!project.owner.toString() === req.user.id && !project.members.some(m => m.user.toString() === req.user.id)) {
                return res.status(401).json({ msg: 'Not authorized' });
            }
        }

        const messages = await Message.find({ thread: req.params.id })
            .populate('sender', 'name')
            .sort({ timestamp: 1 });

        // Mark as read
        await Message.updateMany(
            { thread: req.params.id, sender: { $ne: req.user.id } },
            { $addToSet: { readBy: req.user.id } }
        );

        res.json(messages);
    } catch (err) {
        console.error('Fetch Messages Error:', err.message);
        res.status(500).json({ msg: 'Server error fetching messages' });
    }
});

// @route   POST api/inbox/thread/:id
// @desc    Send a message in a thread
// @access  Private
router.post('/thread/:id', auth, async (req, res) => {
    const { text } = req.body;
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ msg: 'Thread not found' });

        const message = new Message({
            thread: req.params.id,
            sender: req.user.id,
            text
        });

        await message.save();

        thread.lastMessage = message._id;
        thread.lastMessageAt = Date.now();
        await thread.save();

        res.json(message);
    } catch (err) {
        console.error('Send Message Error:', err.message);
        res.status(500).json({ msg: 'Server error sending message' });
    }
});

// Helper to find or create DM thread
router.post('/dm/:userId', auth, async (req, res) => {
    try {
        let thread = await Thread.findOne({
            type: 'dm',
            users: { $all: [req.user.id, req.params.userId] }
        });

        if (!thread) {
            // Verify friendship first
            const friends = await Friendship.findOne({ users: { $all: [req.user.id, req.params.userId] } });
            if (!friends) return res.status(400).json({ msg: 'Must be friends to DM' });

            thread = new Thread({
                type: 'dm',
                users: [req.user.id, req.params.userId]
            });
            await thread.save();
        }

        res.json(thread);
    } catch (err) {
        console.error('DM Thread Error:', err.message);
        res.status(500).json({ msg: 'Server error initializing DM' });
    }
});

module.exports = router;
