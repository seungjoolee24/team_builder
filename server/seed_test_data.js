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
    { name: 'Shin Dong-wook', email: 'dongwook@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Blockchain', 'Security', 'Quiet'], skills: [{ name: 'C++', category: 'Programming', level: 'intermediate' }, { name: 'Go', category: 'Programming', level: 'beginner' }, { name: 'Solidity', category: 'Programming', level: 'beginner' }] },
    { name: 'Alice Kim', email: 'alice@sogang.ac.kr', role: 'designer', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['UI/UX', 'Portfolio', 'Creative'], skills: [{ name: 'Figma', category: 'Design', level: 'advanced' }, { name: 'Adobe XD', category: 'Design', level: 'intermediate' }] },
    { name: 'Bob Park', email: 'bob@sogang.ac.kr', role: 'frontend', major: 'Economics', college: 'Economics', tags: ['Web/App', 'React', 'Fintech'], skills: [{ name: 'React', category: 'Frameworks', level: 'intermediate' }, { name: 'JavaScript', category: 'Programming', level: 'advanced' }] },
    { name: 'Charlie Lee', email: 'charlie@sogang.ac.kr', role: 'planner', major: 'Sociology', college: 'Social Sciences', tags: ['Leadership', 'Networking', 'Project Manager'], skills: [{ name: 'Jira', category: 'Other', level: 'advanced' }, { name: 'Confluence', category: 'Other', level: 'advanced' }] },
    { name: 'David Choi', email: 'david@sogang.ac.kr', role: 'backend', major: 'Physics', college: 'Natural Sciences', tags: ['Python', 'Data Science', 'Analytical'], skills: [{ name: 'Python', category: 'Programming', level: 'advanced' }, { name: 'C++', category: 'Programming', level: 'intermediate' }] },
    { name: 'Eve Jung', email: 'eve@sogang.ac.kr', role: 'data', major: 'Mathematics', college: 'Natural Sciences', tags: ['Big Data', 'Machine Learning', 'Research'], skills: [{ name: 'R', category: 'Programming', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'advanced' }] },
    { name: 'Frank Kang', email: 'frank@sogang.ac.kr', role: 'media', major: 'Global Korean Studies', college: 'Integrated Knowledge', tags: ['Video Editing', 'Creative', 'Fun'], skills: [{ name: 'Final Cut', category: 'Design', level: 'advanced' }, { name: 'DaVinci Resolve', category: 'Design', level: 'intermediate' }] },
    { name: 'Grace Yoon', email: 'grace@sogang.ac.kr', role: 'frontend', major: 'French Language and Literature', college: 'Humanities', tags: ['Portfolio', 'Passion', 'Quick Learner'], skills: [{ name: 'Vue.js', category: 'Frameworks', level: 'intermediate' }, { name: 'HTML/CSS', category: 'Programming', level: 'advanced' }] },
    { name: 'Henry Lim', email: 'henry@sogang.ac.kr', role: 'planner', major: 'Political Science', college: 'Social Sciences', tags: ['Marketing', 'Networking', 'Communication'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'PPT', category: 'Design', level: 'advanced' }] },
    { name: 'Iris Han', email: 'iris@sogang.ac.kr', role: 'designer', major: 'History', college: 'Humanities', tags: ['Graphics', 'Illustrator', 'Creative'], skills: [{ name: 'Photoshop', category: 'Design', level: 'advanced' }, { name: 'Illustrator', category: 'Design', level: 'advanced' }] },
    { name: 'Jack Shin', email: 'jack@sogang.ac.kr', role: 'backend', major: 'Chemistry', college: 'Natural Sciences', tags: ['Logical', 'Systematic', 'Quiet'], skills: [{ name: 'Java', category: 'Programming', level: 'intermediate' }, { name: 'Spring', category: 'Frameworks', level: 'beginner' }] },
    // New 20 Users
    { name: 'Liam Kim', email: 'liam@sogang.ac.kr', role: 'frontend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['React', 'Redux', 'Web3'], skills: [{ name: 'React', category: 'Frameworks', level: 'advanced' }, { name: 'Solidity', category: 'Programming', level: 'intermediate' }] },
    { name: 'Noah Park', email: 'noah@sogang.ac.kr', role: 'backend', major: 'Electronic Engineering', college: 'Engineering', tags: ['IoT', 'Embedded', 'C'], skills: [{ name: 'C', category: 'Programming', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }] },
    { name: 'Oliver Lee', email: 'oliver@sogang.ac.kr', role: 'designer', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['3D', 'Motion', 'Cinema4D'], skills: [{ name: 'Cinema4D', category: 'Design', level: 'advanced' }, { name: 'After Effects', category: 'Design', level: 'advanced' }] },
    { name: 'Elijah Choi', email: 'elijah@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['Strategy', 'Finance', 'Startup'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'Figma', category: 'Design', level: 'beginner' }] },
    { name: 'James Jung', email: 'james@sogang.ac.kr', role: 'data', major: 'Mathematics', college: 'Natural Sciences', tags: ['Statistics', 'R', 'Analysis'], skills: [{ name: 'R', category: 'Programming', level: 'advanced' }, { name: 'SQL', category: 'Programming', level: 'advanced' }] },
    { name: 'William Han', email: 'william@sogang.ac.kr', role: 'media', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['Sound', 'Production', 'Music'], skills: [{ name: 'Logic Pro', category: 'Design', level: 'advanced' }, { name: 'Pro Tools', category: 'Design', level: 'intermediate' }] },
    { name: 'Benjamin Yoon', email: 'benjamin@sogang.ac.kr', role: 'frontend', major: 'Psychology', college: 'Social Sciences', tags: ['UX Research', 'Frontend', 'Empathy'], skills: [{ name: 'JavaScript', category: 'Programming', level: 'intermediate' }, { name: 'HTML/CSS', category: 'Programming', level: 'advanced' }] },
    { name: 'Lucas Kang', email: 'lucas@sogang.ac.kr', role: 'backend', major: 'Physics', college: 'Natural Sciences', tags: ['Quantum', 'Simulation', 'Python'], skills: [{ name: 'Python', category: 'Programming', level: 'advanced' }, { name: 'MATLAB', category: 'Other', level: 'intermediate' }] },
    { name: 'Henry Cho', email: 'henry.c@sogang.ac.kr', role: 'designer', major: 'American Culture', college: 'Humanities', tags: ['Typography', 'Editorial', 'English'], skills: [{ name: 'InDesign', category: 'Design', level: 'advanced' }, { name: 'Photoshop', category: 'Design', level: 'intermediate' }] },
    { name: 'Alexander Song', email: 'alex@sogang.ac.kr', role: 'planner', major: 'Political Science', college: 'Social Sciences', tags: ['Debate', 'Logic', 'Leadership'], skills: [{ name: 'Word', category: 'Other', level: 'advanced' }, { name: 'Notion', category: 'Other', level: 'advanced' }] },
    { name: 'Emma Hong', email: 'emma@sogang.ac.kr', role: 'frontend', major: 'Chinese Culture', college: 'Humanities', tags: ['Mobile', 'Flutter', 'Global'], skills: [{ name: 'Flutter', category: 'Frameworks', level: 'intermediate' }, { name: 'Dart', category: 'Programming', level: 'intermediate' }] },
    { name: 'Charlotte Bae', email: 'charlotte@sogang.ac.kr', role: 'backend', major: 'Chemistry', college: 'Natural Sciences', tags: ['Lab', 'Data', 'Python'], skills: [{ name: 'Python', category: 'Programming', level: 'intermediate' }, { name: 'Excel', category: 'Other', level: 'advanced' }] },
    { name: 'Amelia Go', email: 'amelia@sogang.ac.kr', role: 'data', major: 'Economics', college: 'Economics', tags: ['Econometrics', 'Stata', 'Forecast'], skills: [{ name: 'Stata', category: 'Other', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }] },
    { name: 'Sophia Shin', email: 'sophia@sogang.ac.kr', role: 'media', major: 'Communication', college: 'Social Sciences', tags: ['Journalism', 'Writing', 'Content'], skills: [{ name: 'Word', category: 'Other', level: 'advanced' }, { name: 'CMS', category: 'Other', level: 'intermediate' }] },
    { name: 'Isabella Kwon', email: 'isabella@sogang.ac.kr', role: 'designer', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Interaction', 'Arduino', 'Creative'], skills: [{ name: 'Arduino', category: 'Other', level: 'intermediate' }, { name: 'Processing', category: 'Programming', level: 'intermediate' }] },
    { name: 'Ava Hwang', email: 'ava@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['HR', 'Management', 'People'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'Slack', category: 'Other', level: 'advanced' }] },
    { name: 'Mia Seo', email: 'mia@sogang.ac.kr', role: 'frontend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Vue', 'Sass', 'Detail'], skills: [{ name: 'Vue.js', category: 'Frameworks', level: 'advanced' }, { name: 'Sass', category: 'Programming', level: 'intermediate' }] },
    { name: 'Evelyn Moon', email: 'evelyn@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Java', 'Spring', 'Server'], skills: [{ name: 'Java', category: 'Programming', level: 'advanced' }, { name: 'Spring Boot', category: 'Frameworks', level: 'advanced' }] },
    { name: 'Harper Ko', email: 'harper@sogang.ac.kr', role: 'data', major: 'Big Data Science', college: 'AI/Graduate', tags: ['Deep Learning', 'Vision', 'AI'], skills: [{ name: 'PyTorch', category: 'Frameworks', level: 'advanced' }, { name: 'OpenCV', category: 'Other', level: 'intermediate' }] },
    { name: 'Luna Jeon', email: 'luna@sogang.ac.kr', role: 'media', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['VR', 'Unity', 'Immersive'], skills: [{ name: 'Unity', category: 'Frameworks', level: 'advanced' }, { name: 'C#', category: 'Programming', level: 'intermediate' }] }
];

const PROJECTS_DATA = [
    { title: 'Sogang Delivery Hub', ownerIndex: 0, type: 'Side Project', domain: 'Web / App', description: 'A delivery consolidation service for Sogang students living in dorms.', ownerRole: 'backend' },
    { title: 'AI Campus Guide', ownerIndex: 1, type: 'Competition', domain: 'AI / Data Science', description: 'AI chatbot that helps freshmens navigate campus life and academic rules.', ownerRole: 'frontend' },
    { title: 'Virtual Art Gallery', ownerIndex: 2, type: 'Club / Study', domain: 'Media Art / Design', description: 'Exhibition space in the metaverse for Art & Tech students.', ownerRole: 'designer' },
    { title: 'Fintech Study Platform', ownerIndex: 3, type: 'Startup / Pre-startup', domain: 'Fintech / Business', description: 'A platform to help students learn investment strategies through simulation.', ownerRole: 'planner' },
    { title: 'Sogang Metaverse Campus', ownerIndex: 10, type: 'Club / Study', domain: 'Media Art / Design', description: 'Expanding our campus into the 3D metaverse for remote events.', ownerRole: 'designer' },
    { title: 'Blockchain Voting System', ownerIndex: 13, type: 'Side Project', domain: 'Security / IT', description: 'A transparent voting system for student council elections.', ownerRole: 'backend' },
    { title: 'Eco-Friendly Campus Map', ownerIndex: 15, type: 'Competition', domain: 'Web / App', description: 'Crowdsourced map for finding recycling spots and green spaces.', ownerRole: 'data' },
    { title: 'Language Exchange Matcher', ownerIndex: 17, type: 'Club / Study', domain: 'Education / Culture', description: 'Helping international students find local study buddies automatically.', ownerRole: 'frontend' },
    { title: 'AI Essay Assistant', ownerIndex: 19, type: 'Side Project', domain: 'AI / Data Science', description: 'LLM-powered tool to help students structure their academic papers.', ownerRole: 'backend' },
    // New 8 Projects (Owners 20-27)
    { title: 'Sogang Carpool', ownerIndex: 20, type: 'Side Project', domain: 'Web / App', description: 'Carpool matching for students commuting from similar areas.', ownerRole: 'frontend' },
    { title: 'Smart Dormitory IoT', ownerIndex: 21, type: 'Competition', domain: 'Security / IT', description: 'IoT system for automatic light and temperature control in dorms.', ownerRole: 'backend' },
    { title: 'Interactive Media Wall', ownerIndex: 22, type: 'Club / Study', domain: 'Media Art / Design', description: 'Installing an interactive art wall in the Gonzaga Plaza.', ownerRole: 'designer' },
    { title: 'Student Crowdfunding', ownerIndex: 23, type: 'Startup / Pre-startup', domain: 'Fintech / Business', description: 'Platform for funding student creative projects and events.', ownerRole: 'planner' },
    { title: 'Campus Data Dashboard', ownerIndex: 25, type: 'Side Project', domain: 'AI / Data Science', description: 'Visualizing campus energy usage and cafeteria crowds in real-time.', ownerRole: 'data' },
    { title: 'Indie Music Collab', ownerIndex: 26, type: 'Club / Study', domain: 'Education / Culture', description: 'Matching composers and vocalists for indie music production.', ownerRole: 'media' },
    { title: 'Psychology Experiment Recruit', ownerIndex: 27, type: 'Competition', domain: 'Web / App', description: 'Easier recruitment platform for psychology experiments.', ownerRole: 'frontend' },
    { title: 'Quantum Computing Study', ownerIndex: 28, type: 'Club / Study', domain: 'AI / Data Science', description: 'Study group for basics of quantum algorithms and Qiskit.', ownerRole: 'backend' }
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
        console.log(`${createdUsers.length} Users and Profiles created.`);

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
        console.log(`${createdProjects.length} Projects created.`);

        // 3. Add Members to Projects (Ensure everyone is in at least 2)
        console.log('Assigning project memberships (All users join 2+ projects)...');

        // Prepare a map to collect members for each project to save efficiently/safely
        const projectMembersMap = {};
        createdProjects.forEach(p => projectMembersMap[p._id] = []);

        // Iterate EVERY user and assign them to 2 or 3 random projects
        for (const user of createdUsers) {
            // Filter out projects they own
            const candidateProjects = createdProjects.filter(p => p.owner.toString() !== user._id.toString());

            // Randomly select 2 or 3 projects
            const joinCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
            const selectedProjects = candidateProjects.sort(() => 0.5 - Math.random()).slice(0, joinCount);

            for (const p of selectedProjects) {
                projectMembersMap[p._id].push(user);
            }
        }

        // Save memberships
        for (const project of createdProjects) {
            const newMembers = projectMembersMap[project._id];
            for (const memberUser of newMembers) {
                // Determine role: try to fill an empty slot, otherwise default to 'Member'
                let roleToAssign = 'Member';
                const openRole = project.roles.find(r => r.filled < r.count);
                if (openRole) {
                    roleToAssign = openRole.role;
                    openRole.filled += 1;
                }

                // Add to members array
                project.members.push({
                    user: memberUser._id,
                    role: roleToAssign
                });
            }
            await project.save(); // Save each project with its new members
        }
        console.log('Project memberships assigned (Dense).');
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
                .slice(0, 4);

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
