const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FriendRequest = require('../models/FriendRequest');
const Friendship = require('../models/Friendship');
const Notification = require('../models/Notification');

// @route   POST api/friends/request
// @desc    Send friend request
// @access  Private
router.post('/request', auth, async (req, res) => {
    const { toUserId, message } = req.body;

    try {
        if (toUserId === req.user.id) return res.status(400).json({ msg: 'Cannot friend yourself' });

        // Check if already friends
        const existingFriendship = await Friendship.findOne({
            users: { $all: [req.user.id, toUserId] }
        });
        if (existingFriendship) return res.status(400).json({ msg: 'Already friends' });

        // Check if pending request
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { from: req.user.id, to: toUserId, status: 'pending' },
                { from: toUserId, to: req.user.id, status: 'pending' }
            ]
        });
        if (existingRequest) return res.status(400).json({ msg: 'Request already pending' });

        const friendRequest = new FriendRequest({
            from: req.user.id,
            to: toUserId,
            message
        });

        await friendRequest.save();

        // Notification
        const notification = new Notification({
            recipient: toUserId,
            type: 'request',
            title: 'Friend Request',
            message: `${req.user.name} sent you a friend request.`,
            link: '#' // Inbox or Profile
        });
        await notification.save();

        res.json(friendRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/friends/request/:id/respond
// @desc    Accept or decline friend request
// @access  Private
router.post('/request/:id/respond', auth, async (req, res) => {
    const { status } = req.body; // accepted, declined

    try {
        const friendRequest = await FriendRequest.findById(req.params.id);
        if (!friendRequest) return res.status(404).json({ msg: 'Request not found' });

        if (friendRequest.to.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        friendRequest.status = status;
        await friendRequest.save();

        if (status === 'accepted') {
            const friendship = new Friendship({
                users: [friendRequest.from, friendRequest.to]
            });
            await friendship.save();
        }

        res.json(friendRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
