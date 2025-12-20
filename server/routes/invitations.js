const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @route   POST api/invitations/project
// @desc    Send project invitation
// @access  Private
router.post('/project', auth, async (req, res) => {
    const { toUserId, projectId, message, roles } = req.body;

    try {
        if (toUserId === req.user.id) {
            return res.status(400).json({ msg: 'Cannot invite yourself' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Only owner can invite' });
        }

        // Check if already invited or already member
        const existing = await Invitation.findOne({ to: toUserId, project: projectId, status: 'pending' });
        if (existing) return res.status(400).json({ msg: 'Invitation already pending' });

        if (project.members.some(m => m.user.toString() === toUserId)) {
            return res.status(400).json({ msg: 'User already a member' });
        }

        const invitation = new Invitation({
            from: req.user.id,
            to: toUserId,
            project: projectId,
            roles: roles || [],
            message
        });

        await invitation.save();

        // Create Notification
        const notification = new Notification({
            recipient: toUserId,
            type: 'invitation',
            title: 'Project Invitation',
            message: `${req.user.name} invited you to join "${project.title}"`,
            link: `/projects/detail.html?id=${projectId}`,
            relatedId: invitation._id
        });
        await notification.save();

        res.json(invitation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/invitations/project/:id
// @desc    Get invitation by ID
// @access  Private
router.get('/project/:id', auth, async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id).populate('project', 'title');
        if (!invitation) return res.status(404).json({ msg: 'Invitation not found' });
        if (invitation.to.toString() !== req.user.id && invitation.from.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        res.json(invitation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/invitations/project/:id/respond
// @desc    Accept or decline invitation
// @access  Private
router.post('/project/:id/respond', auth, async (req, res) => {
    const { status, role } = req.body; // accepted, declined

    try {
        const invitation = await Invitation.findById(req.params.id);
        if (!invitation) return res.status(404).json({ msg: 'Invitation not found' });

        if (invitation.to.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        invitation.status = status;
        await invitation.save();

        // Mark notification as read
        await Notification.updateMany(
            { recipient: req.user.id, relatedId: req.params.id, type: 'invitation' },
            { isRead: true }
        );

        if (status === 'accepted') {
            const project = await Project.findById(invitation.project);
            if (project) {
                // Add to members
                if (!project.members.some(m => m.user.toString() === req.user.id)) {
                    project.members.push({ user: req.user.id, role: role || 'Member' });
                    // Increment filled count if role matches
                    if (role) {
                        const rDef = project.roles.find(r => r.role === role);
                        if (rDef) rDef.filled += 1;
                    }
                    await project.save();
                }
            }
        }

        res.json(invitation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
