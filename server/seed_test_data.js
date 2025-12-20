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

// 1. Defined 40 Users (Diverse roles and new tags)
const USERS_DATA = [
    // 1-10: Engineering & Devs
    { name: 'Kim Min-jun', email: 'minjun@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Web/App', 'AI/Data', 'High Passion'], skills: [{ name: 'Node.js', category: 'Frameworks', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }, { name: 'MongoDB', category: 'Infrastructure', level: 'intermediate' }] },
    { name: 'Lee Seo-yeon', email: 'seoyeon@sogang.ac.kr', role: 'frontend', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Web/App', 'Designer', 'Hybrid'], skills: [{ name: 'React', category: 'Frameworks', level: 'advanced' }, { name: 'CSS/HTML', category: 'Programming', level: 'advanced' }, { name: 'Figma', category: 'Design', level: 'intermediate' }] },
    { name: 'Park Ji-hoo', email: 'jihoo@sogang.ac.kr', role: 'game', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Metaverse', 'Game Dev', 'Offline Preferred'], skills: [{ name: 'Unity', category: 'Frameworks', level: 'advanced' }, { name: 'C#', category: 'Programming', level: 'intermediate' }, { name: 'Blender', category: 'Design', level: 'intermediate' }] },
    { name: 'Choi Yuna', email: 'yuna@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['Startup', 'Fintech', 'Serious & Committed'], skills: [{ name: 'Jira', category: 'Other', level: 'intermediate' }, { name: 'Excel', category: 'Other', level: 'advanced' }] },
    { name: 'Jung Ha-rin', email: 'harin@sogang.ac.kr', role: 'devops', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Cloud', 'Infrastructure', 'AWS'], skills: [{ name: 'AWS', category: 'Infrastructure', level: 'advanced' }, { name: 'Docker', category: 'Infrastructure', level: 'intermediate' }] },
    { name: 'Kang Do-hyeon', email: 'dohyeon@sogang.ac.kr', role: 'data', major: 'Convergence Software', college: 'AI/Graduate', tags: ['AI/Data', 'Research', 'Academic'], skills: [{ name: 'PyTorch', category: 'Frameworks', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'advanced' }] },
    { name: 'Yoon Seo-woo', email: 'seowoo@sogang.ac.kr', role: 'media', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['Media Art', 'Creative', 'Fun'], skills: [{ name: 'Premiere Pro', category: 'Design', level: 'advanced' }, { name: 'TouchDesigner', category: 'Design', level: 'intermediate' }] },
    { name: 'Lim Joon-young', email: 'joonyoung@sogang.ac.kr', role: 'mobile', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Mobile', 'Flutter', 'Team Player'], skills: [{ name: 'Flutter', category: 'Frameworks', level: 'advanced' }, { name: 'Dart', category: 'Programming', level: 'intermediate' }] },
    { name: 'Han Ji-eun', email: 'jieun@sogang.ac.kr', role: 'marketing', major: 'Global Korean Studies', college: 'Integrated Knowledge', tags: ['Networking', 'Cultural', 'Social Impact'], skills: [{ name: 'PowerPoint', category: 'Design', level: 'advanced' }, { name: 'Instagram', category: 'Other', level: 'advanced' }] },
    { name: 'Shin Dong-wook', email: 'dongwook@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Blockchain', 'Security', 'Deep Tech'], skills: [{ name: 'Solidity', category: 'Programming', level: 'intermediate' }, { name: 'Go', category: 'Programming', level: 'intermediate' }] },

    // 11-20: Design, Media, & Humanities
    { name: 'Alice Kim', email: 'alice@sogang.ac.kr', role: 'designer', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['UI/UX', 'Portfolio', 'Creative'], skills: [{ name: 'Figma', category: 'Design', level: 'advanced' }, { name: 'Adobe XD', category: 'Design', level: 'intermediate' }] },
    { name: 'Bob Park', email: 'bob@sogang.ac.kr', role: 'frontend', major: 'Economics', college: 'Economics', tags: ['Web/App', 'React', 'Fintech'], skills: [{ name: 'React', category: 'Frameworks', level: 'intermediate' }, { name: 'JavaScript', category: 'Programming', level: 'advanced' }] },
    { name: 'Charlie Lee', email: 'charlie@sogang.ac.kr', role: 'planner', major: 'Sociology', college: 'Social Sciences', tags: ['Leadership', 'Networking', 'Social Impact'], skills: [{ name: 'Jira', category: 'Other', level: 'advanced' }, { name: 'Notion', category: 'Other', level: 'advanced' }] },
    { name: 'David Choi', email: 'david@sogang.ac.kr', role: 'backend', major: 'Physics', college: 'Natural Sciences', tags: ['Python', 'Data Science', 'Analytical'], skills: [{ name: 'Python', category: 'Programming', level: 'advanced' }, { name: 'C++', category: 'Programming', level: 'intermediate' }] },
    { name: 'Eve Jung', email: 'eve@sogang.ac.kr', role: 'data', major: 'Mathematics', college: 'Natural Sciences', tags: ['Big Data', 'Machine Learning', 'Research'], skills: [{ name: 'R', category: 'Programming', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'advanced' }] },
    { name: 'Frank Kang', email: 'frank@sogang.ac.kr', role: 'media', major: 'Global Korean Studies', college: 'Integrated Knowledge', tags: ['Video Editing', 'Creative', 'Lifestyle'], skills: [{ name: 'Final Cut', category: 'Design', level: 'advanced' }, { name: 'DaVinci Resolve', category: 'Design', level: 'intermediate' }] },
    { name: 'Grace Yoon', email: 'grace@sogang.ac.kr', role: 'frontend', major: 'French Language and Literature', college: 'Humanities', tags: ['Portfolio', 'Passion', 'Quick Learner'], skills: [{ name: 'Vue.js', category: 'Frameworks', level: 'intermediate' }, { name: 'HTML/CSS', category: 'Programming', level: 'advanced' }] },
    { name: 'Henry Lim', email: 'henry@sogang.ac.kr', role: 'marketing', major: 'Political Science', college: 'Social Sciences', tags: ['Marketing', 'Networking', 'Communication'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'PPT', category: 'Design', level: 'advanced' }] },
    { name: 'Iris Han', email: 'iris@sogang.ac.kr', role: 'designer', major: 'History', college: 'Humanities', tags: ['Graphics', 'Illustrator', 'Creative'], skills: [{ name: 'Photoshop', category: 'Design', level: 'advanced' }, { name: 'Illustrator', category: 'Design', level: 'advanced' }] },
    { name: 'Jack Shin', email: 'jack@sogang.ac.kr', role: 'backend', major: 'Chemistry', college: 'Natural Sciences', tags: ['Logical', 'Systematic', 'Quiet'], skills: [{ name: 'Java', category: 'Programming', level: 'intermediate' }, { name: 'Spring', category: 'Frameworks', level: 'beginner' }] },

    // 21-30: Varied Mix (New Roles Focus)
    { name: 'Liam Kim', email: 'liam@sogang.ac.kr', role: 'mobile', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Web3', 'Blockchain', 'Deep Tech'], skills: [{ name: 'React Native', category: 'Frameworks', level: 'advanced' }, { name: 'Solidity', category: 'Programming', level: 'intermediate' }] },
    { name: 'Noah Park', email: 'noah@sogang.ac.kr', role: 'devops', major: 'Electronic Engineering', college: 'Engineering', tags: ['IoT', 'Embedded', 'Azure'], skills: [{ name: 'Kubernetes', category: 'Infrastructure', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }] },
    { name: 'Oliver Lee', email: 'oliver@sogang.ac.kr', role: 'game', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['3D', 'Motion', 'Unreal'], skills: [{ name: 'Unreal Engine', category: 'Frameworks', level: 'advanced' }, { name: 'C++', category: 'Programming', level: 'intermediate' }] },
    { name: 'Elijah Choi', email: 'elijah@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['Strategy', 'Finance', 'Startup'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'Tableau', category: 'Other', level: 'intermediate' }] },
    { name: 'James Jung', email: 'james@sogang.ac.kr', role: 'data', major: 'Mathematics', college: 'Natural Sciences', tags: ['Statistics', 'R', 'Analysis'], skills: [{ name: 'R', category: 'Programming', level: 'advanced' }, { name: 'SQL', category: 'Programming', level: 'advanced' }] },
    { name: 'William Han', email: 'william@sogang.ac.kr', role: 'media', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['Sound', 'Production', 'Music'], skills: [{ name: 'Logic Pro', category: 'Design', level: 'advanced' }, { name: 'Pro Tools', category: 'Design', level: 'intermediate' }] },
    { name: 'Benjamin Yoon', email: 'benjamin@sogang.ac.kr', role: 'frontend', major: 'Psychology', college: 'Social Sciences', tags: ['UX Research', 'Frontend', 'Empathy'], skills: [{ name: 'JavaScript', category: 'Programming', level: 'intermediate' }, { name: 'HTML/CSS', category: 'Programming', level: 'advanced' }] },
    { name: 'Lucas Kang', email: 'lucas@sogang.ac.kr', role: 'backend', major: 'Physics', college: 'Natural Sciences', tags: ['Quantum', 'Simulation', 'Python'], skills: [{ name: 'Python', category: 'Programming', level: 'advanced' }, { name: 'MATLAB', category: 'Other', level: 'intermediate' }] },
    { name: 'Henry Cho', email: 'henry.c@sogang.ac.kr', role: 'designer', major: 'American Culture', college: 'Humanities', tags: ['Typography', 'Editorial', 'English'], skills: [{ name: 'InDesign', category: 'Design', level: 'advanced' }, { name: 'Photoshop', category: 'Design', level: 'intermediate' }] },
    { name: 'Alexander Song', email: 'alex@sogang.ac.kr', role: 'marketing', major: 'Political Science', college: 'Social Sciences', tags: ['Debate', 'Logic', 'Leadership'], skills: [{ name: 'Word', category: 'Other', level: 'advanced' }, { name: 'Notion', category: 'Other', level: 'advanced' }] },

    // 31-40: More new profiles
    { name: 'Emma Hong', email: 'emma@sogang.ac.kr', role: 'mobile', major: 'Chinese Culture', college: 'Humanities', tags: ['Cross-platform', 'Flutter', 'Global'], skills: [{ name: 'Flutter', category: 'Frameworks', level: 'intermediate' }, { name: 'Dart', category: 'Programming', level: 'intermediate' }] },
    { name: 'Charlotte Bae', email: 'charlotte@sogang.ac.kr', role: 'backend', major: 'Chemistry', college: 'Natural Sciences', tags: ['Lab', 'Data', 'Python'], skills: [{ name: 'Python', category: 'Programming', level: 'intermediate' }, { name: 'Excel', category: 'Other', level: 'advanced' }] },
    { name: 'Amelia Go', email: 'amelia@sogang.ac.kr', role: 'data', major: 'Economics', college: 'Economics', tags: ['Econometrics', 'Stata', 'Forecast'], skills: [{ name: 'Stata', category: 'Other', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }] },
    { name: 'Sophia Shin', email: 'sophia@sogang.ac.kr', role: 'media', major: 'Communication', college: 'Social Sciences', tags: ['Journalism', 'Writing', 'Content'], skills: [{ name: 'Word', category: 'Other', level: 'advanced' }, { name: 'CMS', category: 'Other', level: 'intermediate' }] },
    { name: 'Isabella Kwon', email: 'isabella@sogang.ac.kr', role: 'designer', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Interaction', 'Arduino', 'Creative'], skills: [{ name: 'Arduino', category: 'Other', level: 'intermediate' }, { name: 'Processing', category: 'Programming', level: 'intermediate' }] },
    { name: 'Ava Hwang', email: 'ava@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['HR', 'Management', 'People'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'Slack', category: 'Other', level: 'advanced' }] },
    { name: 'Mia Seo', email: 'mia@sogang.ac.kr', role: 'frontend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Vue', 'Sass', 'Detail'], skills: [{ name: 'Vue.js', category: 'Frameworks', level: 'advanced' }, { name: 'Sass', category: 'Programming', level: 'intermediate' }] },
    { name: 'Evelyn Moon', email: 'evelyn@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Java', 'Spring', 'Server'], skills: [{ name: 'Java', category: 'Programming', level: 'advanced' }, { name: 'Spring Boot', category: 'Frameworks', level: 'advanced' }] },
    { name: 'Harper Ko', email: 'harper@sogang.ac.kr', role: 'data', major: 'Big Data Science', college: 'AI/Graduate', tags: ['Deep Learning', 'Vision', 'AI'], skills: [{ name: 'PyTorch', category: 'Frameworks', level: 'advanced' }, { name: 'OpenCV', category: 'Other', level: 'intermediate' }] },
    { name: 'Luna Jeon', email: 'luna@sogang.ac.kr', role: 'game', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['VR', 'Unity', 'Immersive'], skills: [{ name: 'Unity', category: 'Frameworks', level: 'advanced' }, { name: 'C#', category: 'Programming', level: 'intermediate' }] }
];

// 2. Defined 15 Projects
const PROJECTS_DATA = [
    { title: 'Sogang Delivery Hub', ownerIndex: 0, type: 'Side Project', domain: 'Web / App', description: 'Consolidation service for dorm deliveries.', ownerRole: 'backend' },
    { title: 'AI Campus Guide Bot', ownerIndex: 5, type: 'Competition', domain: 'AI / Data Science', description: 'Freshman guide chatbot specialized for Sogang rules.', ownerRole: 'data' },
    { title: 'Virtual Art Gallery', ownerIndex: 2, type: 'Club / Study', domain: 'Media Art / Design', description: 'Metaverse exhibition space for Art&Tech work.', ownerRole: 'game' },
    { title: 'Fintech Simulation', ownerIndex: 3, type: 'Startup / Pre-startup', domain: 'Fintech / Business', description: 'Stock investment simulation game for students.', ownerRole: 'planner' },
    { title: 'Sogang Carpool App', ownerIndex: 7, type: 'Side Project', domain: 'Web / App', description: 'Carpool matching for students living nearby.', ownerRole: 'mobile' },
    { title: 'Blockchain Voting System', ownerIndex: 9, type: 'Competition', domain: 'Security / IT', description: 'Transparent election system using smart contracts.', ownerRole: 'backend' },
    { title: 'Eco-Friendly Map', ownerIndex: 14, type: 'Volunteering', domain: 'Web / App', description: 'Map for finding recycling bins on campus.', ownerRole: 'data' },
    { title: 'Language Exchange Matcher', ownerIndex: 8, type: 'Club / Study', domain: 'Education / Culture', description: 'Matching exchange students with locals.', ownerRole: 'marketing' },
    { title: 'AI Essay Assistant', ownerIndex: 6, type: 'Side Project', domain: 'AI / Data Science', description: 'Checking grammar and structure for papers.', ownerRole: 'media' },
    { title: 'Smart Dorm IoT', ownerIndex: 21, type: 'Competition', domain: 'IoT / Hardware', description: 'Auto-control lighting and heating.', ownerRole: 'devops' },
    { title: 'Interactive Media Wall', ownerIndex: 10, type: 'Club / Study', domain: 'Media Art / Design', description: 'Installation art for the Gonzaga Plaza.', ownerRole: 'designer' },
    { title: 'Student Crowdfunding', ownerIndex: 24, type: 'Startup / Pre-startup', domain: 'Fintech / Business', description: 'Funding platform for student projects.', ownerRole: 'planner' },
    { title: 'Campus Data Dashboard', ownerIndex: 4, type: 'Side Project', domain: 'AI / Data Science', description: 'Real-time cafeteria crowd visualization.', ownerRole: 'devops' },
    { title: 'Indie Music Collaboration', ownerIndex: 26, type: 'Club / Study', domain: 'Education / Culture', description: 'Finding session members for bands.', ownerRole: 'media' },
    { title: 'Psychology Experiment Recruit', ownerIndex: 27, type: 'Research', domain: 'Web / App', description: 'Easier recruitment for psychology department.', ownerRole: 'frontend' }
];

const seed = async () => {
    try {
        await connectDB();
        console.log('Connected to DB. Resetting from scratch...');

        // Clear everything
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
                bio: `Hi, I am ${data.name}. Ready to collaborate on ${data.tags[0]} projects!`
            });
            await profile.save();
            createdUsers.push(user);
        }
        console.log(`${createdUsers.length} Users created.`);

        // 2. Create Projects & Assign Members (4-8 members logic)
        // Each project needs: Owner + (3 to 7) members = Total 4 to 8.
        const createdProjects = [];
        for (const p of PROJECTS_DATA) {
            const owner = createdUsers[p.ownerIndex];
            // Identify possible members (everyone except owner)
            const candidates = createdUsers.filter(u => u._id.toString() !== owner._id.toString());

            const project = new Project({
                title: p.title,
                oneLineDescription: p.description,
                type: p.type,
                domain: p.domain,
                description: p.description + ' looking for passionate teammates.',
                owner: owner._id,
                status: 'OPEN',
                roles: [
                    { role: 'frontend', count: 2, filled: 0 },
                    { role: 'backend', count: 2, filled: 0 },
                    { role: 'designer', count: 1, filled: 0 },
                    { role: 'planner', count: 1, filled: 0 }
                ],
                members: [{ user: owner._id, role: p.ownerRole }]
            });

            // Calculate total slots defined in roles
            const totalProjectSlots = project.roles.reduce((acc, r) => acc + r.count, 0);

            // Randomly select 2 to 4 additional members (Ensure we don't overflow)
            let targetAdditionalCount = 2 + Math.floor(Math.random() * 3); // 2, 3, 4

            // Cap at avail capacity (Total - Owner)
            if (targetAdditionalCount > (totalProjectSlots - 1)) {
                targetAdditionalCount = totalProjectSlots - 1;
            }

            const selectedMembers = candidates.sort(() => 0.5 - Math.random()).slice(0, targetAdditionalCount);

            // Count Owner's role first
            const ownerRoleObj = project.roles.find(r => r.role === p.ownerRole);
            if (ownerRoleObj && ownerRoleObj.filled < ownerRoleObj.count) {
                ownerRoleObj.filled += 1;
            }

            // Add selected members
            for (const m of selectedMembers) {
                // Determine a needed role
                // Find roles that are NOT full
                const availableRoles = project.roles.filter(r => r.filled < r.count);

                if (availableRoles.length === 0) break; // Should not happen if logic is correct but safe check

                // Pick a random available role
                const rObj = availableRoles[Math.floor(Math.random() * availableRoles.length)];

                project.members.push({ user: m._id, role: rObj.role });
                rObj.filled += 1;
            }

            await project.save();
            createdProjects.push(project);
        }
        console.log(`${createdProjects.length} Projects created (sizes 4-8).`);

        // 3. Create Friendships
        // Ensure everyone has ~3-6 friends
        for (let i = 0; i < createdUsers.length; i++) {
            const userA = createdUsers[i];
            const friendCount = 3 + Math.floor(Math.random() * 4); // 3-6

            // Pick randos
            const possibleFriends = createdUsers.filter(u => u._id.toString() !== userA._id.toString());
            const picked = possibleFriends.sort(() => 0.5 - Math.random()).slice(0, friendCount);

            for (const userB of picked) {
                // Check existence
                const exists = await Friendship.findOne({ users: { $all: [userA._id, userB._id] } });
                if (!exists) {
                    const fs = new Friendship({ users: [userA._id, userB._id] });
                    await fs.save();
                }
            }
        }
        console.log('Friendships created.');

        console.log('--- SEED COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
