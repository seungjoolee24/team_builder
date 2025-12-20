const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Project = require('../models/Project');

// @route   GET api/notifications
// @desc    Get current user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id }).sort({ timestamp: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/notifications/invite
// @desc    Send an invitation
// @access  Private
router.post('/invite', auth, async (req, res) => {
    const { targetEmail, projectId } = req.body;

    try {
        const targetUser = await User.findOne({ email: targetEmail });
        if (!targetUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Verify ownership
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const user = await User.findById(req.user.id);

        const newNotification = new Notification({
            recipient: targetUser.id,
            type: 'invitation',
            title: 'Project Invitation',
            message: `${user.name} invited you to join "${project.title}"`,
            link: `projects/join.html?id=${projectId}`
        });

        await newNotification.save();
        res.json(newNotification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        // Verify recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
