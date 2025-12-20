const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Profile = require('./models/Profile');
const Project = require('./models/Project');
const Friendship = require('./models/Friendship');

const USERS_DATA = [
    { name: 'Kim Min-jun', email: 'minjun@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Web/App', 'AI/Data', 'High Passion'], skills: [{ name: 'Node.js', category: 'Frameworks', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }, { name: 'MongoDB', category: 'Other', level: 'intermediate' }] },
    { name: 'Lee Seo-yeon', email: 'seoyeon@sogang.ac.kr', role: 'frontend', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Web/App', 'Designer', 'Hybrid'], skills: [{ name: 'React', category: 'Frameworks', level: 'advanced' }, { name: 'CSS/HTML', category: 'Programming', level: 'advanced' }, { name: 'JavaScript', category: 'Programming', level: 'intermediate' }] },
    { name: 'Park Ji-hoo', email: 'jihoo@sogang.ac.kr', role: 'designer', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Metaverse', 'Game Dev', 'Offline Preferred'], skills: [{ name: 'Figma', category: 'Design', level: 'advanced' }, { name: 'Blender', category: 'Design', level: 'intermediate' }, { name: 'Unity', category: 'Frameworks', level: 'beginner' }] },
    { name: 'Choi Yuna', email: 'yuna@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['Startup', 'Fintech', 'Serious & Committed'], skills: [{ name: 'Jira', category: 'Other', level: 'intermediate' }, { name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'PPT', category: 'Design', level: 'advanced' }] },
    { name: 'Jung Ha-rin', email: 'harin@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Cloud Computing', 'Enterprise', 'Growth Mindset'], skills: [{ name: 'Java', category: 'Programming', level: 'advanced' }, { name: 'Spring Boot', category: 'Frameworks', level: 'intermediate' }, { name: 'AWS', category: 'Other', level: 'beginner' }] },
    { name: 'Kang Do-hyeon', email: 'dohyeon@sogang.ac.kr', role: 'data', major: 'Convergence Software', college: 'AI/Graduate', tags: ['AI/Data', 'Research', 'Academic'], skills: [{ name: 'PyTorch', category: 'Frameworks', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'advanced' }, { name: 'SQL', category: 'Programming', level: 'intermediate' }] },
    { name: 'Yoon Seo-woo', email: 'seowoo@sogang.ac.kr', role: 'media', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['Media Art', 'Creative', 'Fun'], skills: [{ name: 'Premiere Pro', category: 'Design', level: 'advanced' }, { name: 'After Effects', category: 'Design', level: 'intermediate' }, { name: 'TouchDesigner', category: 'Other', level: 'beginner' }] },
    { name: 'Lim Joon-young', email: 'joonyoung@sogang.ac.kr', role: 'frontend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Web/App', 'React', 'Team Player'], skills: [{ name: 'Vue.js', category: 'Frameworks', level: 'intermediate' }, { name: 'TypeScript', category: 'Programming', level: 'intermediate' }, { name: 'Git', category: 'Other', level: 'advanced' }] },
    { name: 'Han Ji-eun', email: 'jieun@sogang.ac.kr', role: 'planner', major: 'Global Korean Studies', college: 'Integrated Knowledge', tags: ['Networking', 'Cultural', 'Flexible Hours'], skills: [{ name: 'Translation', category: 'Other', level: 'advanced' }, { name: 'Event Planning', category: 'Other', level: 'intermediate' }] },
    { name: 'Shin Dong-wook', email: 'dongwook@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Blockchain', 'Security', 'Quiet'], skills: [{ name: 'C++', category: 'Programming', level: 'intermediate' }, { name: 'Go', category: 'Programming', level: 'beginner' }, { name: 'Solidity', category: 'Programming', level: 'beginner' }] }
];

const PROJECTS_DATA = [
    { title: 'Sogang Delivery Hub', ownerIndex: 0, type: 'Side Project', domain: 'Web / App', description: 'A delivery consolidation service for Sogang students living in dorms.', ownerRole: 'backend' },
    { title: 'AI Campus Guide', ownerIndex: 1, type: 'Competition', domain: 'AI / Data Science', description: 'AI chatbot that helps freshmens navigate campus life and academic rules.', ownerRole: 'frontend' },
    { title: 'Virtual Art Gallery', ownerIndex: 2, type: 'Club / Study', domain: 'Media Art / Design', description: 'Exhibition space in the metaverse for Art & Tech students.', ownerRole: 'designer' },
    { title: 'Fintech Study Platform', ownerIndex: 3, type: 'Startup / Pre-startup', domain: 'Fintech / Business', description: 'A platform to help students learn investment strategies through simulation.', ownerRole: 'planner' }
];

const seed = async () => {
    try {
        await connectDB();
        console.log('Connected to DB. Resetting...');

        // Reset all relevant collections
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Project.deleteMany({});
        await Friendship.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('sogang123', salt);

        // 1. Create Users & Profiles
        const createdUsers = [];
        for (const data of USERS_DATA) {
            const user = new User({ name: data.name, email: data.email, password, tags: data.tags });
            await user.save();
            const profile = new Profile({
                user: user._id,
                college: data.college,
                major: data.major,
                primaryRole: data.role,
                skills: data.skills || [],
                bio: `Hi, I am ${data.name} from ${data.major}. Let's build something great!`
            });
            await profile.save();
            createdUsers.push(user);
        }
        console.log('10 Users and Profiles created.');

        // 2. Create Projects
        const createdProjects = [];
        for (const p of PROJECTS_DATA) {
            const owner = createdUsers[p.ownerIndex];
            const project = new Project({
                title: p.title,
                oneLineDescription: p.title + ' Prototype',
                type: p.type,
                domain: p.domain,
                description: p.description,
                owner: owner._id,
                status: 'OPEN',
                roles: [
                    { role: 'frontend', count: 1, filled: 0 },
                    { role: 'backend', count: 1, filled: 0 },
                    { role: 'designer', count: 1, filled: 0 }
                ],
                // Add owner as member with their selected role
                members: [{
                    user: owner._id,
                    role: p.ownerRole
                }]
            });
            await project.save();
            createdProjects.push(project);
        }
        console.log('4 Projects created.');

        // 3. Add Members to Projects (In 2-3 projects each)
        // Each project gets ~2-3 additional members from the rest
        for (let i = 0; i < createdProjects.length; i++) {
            const project = createdProjects[i];
            const otherUsers = createdUsers.filter(u => u._id.toString() !== project.owner.toString());
            // Pick 2 random users to join
            const shuffled = otherUsers.sort(() => 0.5 - Math.random());
            const membersToAdd = shuffled.slice(0, 2);

            for (const member of membersToAdd) {
                // Find a role that isn't the owner's role
                const ownerRole = project.members[0].role;
                const availableRole = project.roles.find(r => r.role !== ownerRole && r.filled < r.count);
                project.members.push({
                    user: member._id,
                    role: availableRole ? availableRole.role : 'Member'
                });
                if (availableRole) availableRole.filled += 1;
            }
            await project.save();
        }
        console.log('Project memberships assigned.');

        // 4. Create Friendships (~5 per user)
        // Simple ring + randomized connections to ensure ~5
        for (let i = 0; i < createdUsers.length; i++) {
            for (let j = 1; j <= 2; j++) { // Connect to next 2 people
                const friendIndex = (i + j) % createdUsers.length;
                const userA = createdUsers[i];
                const userB = createdUsers[friendIndex];

                const exists = await Friendship.findOne({ users: { $all: [userA._id, userB._id] } });
                if (!exists) {
                    const fs = new Friendship({ users: [userA._id, userB._id] });
                    await fs.save();
                }
            }
            // Add some random ones
            const randomIndexes = Array.from({ length: createdUsers.length }, (_, k) => k)
                .filter(k => k !== i)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            for (const rIdx of randomIndexes) {
                const userA = createdUsers[i];
                const userB = createdUsers[rIdx];
                const exists = await Friendship.findOne({ users: { $all: [userA._id, userB._id] } });
                if (!exists) {
                    const fs = new Friendship({ users: [userA._id, userB._id] });
                    await fs.save();
                }
            }
        }
        console.log('Friendships created.');

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
