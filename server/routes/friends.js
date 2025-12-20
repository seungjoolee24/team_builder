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
            link: '#', // Inbox or Profile
            relatedId: friendRequest._id
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

// @route   GET api/friends
// @desc    Get all friends for current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const friendships = await Friendship.find({
            users: req.user.id
        }).populate('users', 'name email');

        // Extract the other user from each friendship
        const friends = friendships.map(f => {
            const otherUser = f.users.find(u => u._id.toString() !== req.user.id);
            return otherUser;
        });

        res.json(friends);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/friends/status/:userId
// @desc    Get friendship status with another user
// @access  Private
router.get('/status/:userId', auth, async (req, res) => {
    try {
        // Check if friends
        const friendship = await Friendship.findOne({
            users: { $all: [req.user.id, req.params.userId] }
        });
        if (friendship) return res.json({ status: 'friends' });

        // Check if pending request from me
        const pendingSent = await FriendRequest.findOne({
            from: req.user.id,
            to: req.params.userId,
            status: 'pending'
        });
        if (pendingSent) return res.json({ status: 'pending_sent' });

        // Check if pending request from them
        const pendingReceived = await FriendRequest.findOne({
            from: req.params.userId,
            to: req.user.id,
            status: 'pending'
        });
        if (pendingReceived) return res.json({ status: 'pending_received', requestId: pendingReceived._id });

        res.json({ status: 'none' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/friends/requests
// @desc    Get all pending friend requests for current user
// @access  Private
router.get('/requests', auth, async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            $or: [{ from: req.user.id }, { to: req.user.id }],
            status: 'pending'
        }).populate('from to', 'name email');

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
