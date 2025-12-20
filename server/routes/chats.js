const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');

// @route   GET api/chats/:projectId
// @desc    Get chats for a project
// @access  Private
router.get('/:projectId', auth, async (req, res) => {
    try {
        // Check if user is member of the project
        const Project = require('../models/Project');
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        const isMember = project.members.some(member => member.user.toString() === req.user.id);
        const isOwner = project.owner.toString() === req.user.id;

        if (!isMember && !isOwner) {
            return res.status(401).json({ msg: 'Not authorized to view this chat' });
        }

        const chats = await Chat.find({ project: req.params.projectId })
            .populate('sender', 'name email')
            .sort({ timestamp: 1 });

        // Transform to match frontend expectation
        const formattedChats = chats.map(chat => ({
            id: chat.id,
            projectId: chat.project,
            senderEmail: chat.sender.email,
            senderName: chat.sender.name,
            message: chat.message,
            timestamp: chat.timestamp
        }));

        res.json(formattedChats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/chats/:projectId
// @desc    Send a chat message
// @access  Private
router.post('/:projectId', auth, async (req, res) => {
    try {
        // Check if user is member of the project
        const Project = require('../models/Project');
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        const isMember = project.members.some(member => member.user.toString() === req.user.id);
        const isOwner = project.owner.toString() === req.user.id;

        if (!isMember && !isOwner) {
            return res.status(401).json({ msg: 'Not authorized to post in this chat' });
        }

        const newChat = new Chat({
            project: req.params.projectId,
            sender: req.user.id,
            message: req.body.message
        });

        const chat = await newChat.save();
        await chat.populate('sender', 'name email');

        const formattedChat = {
            id: chat.id,
            projectId: chat.project,
            senderEmail: chat.sender.email,
            senderName: chat.sender.name,
            message: chat.message,
            timestamp: chat.timestamp
        };

        res.json(formattedChat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
