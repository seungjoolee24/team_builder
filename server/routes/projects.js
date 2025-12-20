const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   GET api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, domain, owner } = req.query;
        const query = {};
        if (type) {
            const typeList = Array.isArray(type) ? type : type.split(',');
            query.type = { $in: typeList };
        }
        if (domain) {
            const domainList = Array.isArray(domain) ? domain : domain.split(',');
            query.domain = { $in: domainList };
        }
        if (owner) {
            query.owner = owner;
        } else {
            // Default public search: only return OPEN projects
            if (!query.status) {
                query.status = 'OPEN';
            }
        }

        const projects = await Project.find(query)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('members.user', 'name email')
            .populate('owner', 'name email');
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/projects
// @desc    Create a project
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { ownerRole, ...projectData } = req.body;

        // Auto-increment filled count if owner takes a role
        if (projectData.roles && ownerRole) {
            const roleIndex = projectData.roles.findIndex(r => r.role === ownerRole);
            if (roleIndex !== -1) {
                projectData.roles[roleIndex].filled = 1;
            }
        }

        const newProject = new Project({
            ...projectData,
            owner: req.user.id,
            members: [{
                user: req.user.id,
                role: ownerRole || 'Leader'
            }]
        });

        const project = await newProject.save();
        await project.populate('owner', 'name email');
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/projects/:id/join
// @desc    Apply to join a project
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Check if already applied
        if (project.applications.some(app => app.applicant.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Already applied' });
        }

        // Check if already member
        if (project.members.some(member => member.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Already a member' });
        }

        const newApplication = {
            applicant: req.user.id,
            preferredRoles: req.body.roles || [],
            message: req.body.message
        };

        project.applications.unshift(newApplication);
        await project.save();

        const savedApp = project.applications[0];

        // Create Notification for Project Owner
        const rolesStr = (req.body.roles || []).join(', ');
        const notification = new Notification({
            recipient: project.owner,
            type: 'project_application',
            title: 'New Project Application',
            message: `${req.user.name} applied for "${project.title}" (${rolesStr})`,
            link: `/workspace.html?id=${project.id}&tab=applications`,
            relatedId: savedApp._id
        });
        await notification.save();

        res.json(project.applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/projects/:id/applications
// @desc    Get applications for a project
// @access  Private
router.get('/:id/applications', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('applications.applicant', 'name email');
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Verify owner
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const formattedApps = project.applications.map(app => ({
            id: app._id,
            projectId: project._id,
            applicantId: app.applicant._id,
            applicantName: app.applicant.name,
            applicantEmail: app.applicant.email,
            role: app.role,
            preferredRoles: app.preferredRoles,
            message: app.message,
            status: app.status,
            appliedAt: app.appliedAt
        }));

        res.json(formattedApps);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/projects/application-details/:appId
// @desc    Get application details by its ID (across all projects)
// @access  Private
router.get('/application-details/:appId', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ "applications._id": req.params.appId }).populate('applications.applicant', 'name email');
        if (!project) return res.status(404).json({ msg: 'Application not found' });

        const app = project.applications.id(req.params.appId);
        if (!app) return res.status(404).json({ msg: 'Application not found' });

        res.json({
            projectId: project._id,
            projectTitle: project.title,
            application: {
                id: app._id,
                applicantName: app.applicant.name,
                preferredRoles: app.preferredRoles,
                message: app.message,
                status: app.status
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/projects/applications/:projectId/:appId
// @desc    Update application status
// @access  Private
router.put('/applications/:projectId/:appId', auth, async (req, res) => {
    const { status } = req.body; // ACCEPTED, REJECTED
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const app = project.applications.id(req.params.appId);
        if (!app) return res.status(404).json({ msg: 'Application not found' });

        app.status = status;

        // If accepted, add to members
        if (status === 'ACCEPTED') {
            // Check if already member
            const finalRole = req.body.role || app.preferredRoles[0] || 'Member';
            project.members.push({
                user: app.applicant,
                role: finalRole
            });

            app.role = finalRole;

            // Update role count
            const roleDef = project.roles.find(r => r.role === finalRole);
            if (roleDef) {
                roleDef.filled += 1;
            }
        }
        await project.save();

        // Mark notification as read
        await Notification.updateMany(
            { recipient: req.user.id, relatedId: req.params.appId, type: 'project_application' },
            { isRead: true }
        );

        res.json(app);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/projects/:id/status
// @desc    Update project status (Only Owner)
// @access  Private
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body; // OPEN, CONFIRMED
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Check ownership
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        project.status = status;
        await project.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/projects/:id/leave
// @desc    Leave a project
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Check if member
        const memberIndex = project.members.findIndex(m => m.user.toString() === req.user.id);
        if (memberIndex === -1) {
            return res.status(400).json({ msg: 'Not a member of this project' });
        }

        // Prevent Owner from leaving (Must delete instead)
        if (project.owner.toString() === req.user.id) {
            return res.status(400).json({ msg: 'Owner cannot leave. Use terminate instead.' });
        }

        const member = project.members[memberIndex];
        const roleName = member.role;

        // Remove member
        project.members.splice(memberIndex, 1);

        // Update role count
        const roleDef = project.roles.find(r => r.role === roleName);
        if (roleDef && roleDef.filled > 0) {
            roleDef.filled -= 1;
        }

        await project.save();
        res.json({ msg: 'Left project successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/projects/:id
// @desc    Delete (Terminate) a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Check ownership
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await project.deleteOne();
        res.json({ msg: 'Project terminated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
