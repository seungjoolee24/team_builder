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
const Notification = require('./models/Notification');

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

// 2. Defined 20 Projects
const PROJECTS_DATA = [
    {
        title: "AI Schedule Optimizer", type: "Side Project", domain: "AI / Data Science", description: "Automated timetabling using Genetic Algorithms.", ownerRole: "backend",
        roles: [{ role: "frontend", count: 2 }, { role: "backend", count: 2 }, { role: "data", count: 2 }, { role: "designer", count: 1 }]
    }, // 7 slots
    {
        title: "Sogang E-Sports Platform", type: "Startup / Pre-startup", domain: "Game Development", description: "Matching platform for university gamers.", ownerRole: "planner",
        roles: [{ role: "game", count: 3 }, { role: "backend", count: 2 }, { role: "designer", count: 1 }, { role: "marketing", count: 1 }]
    }, // 7 slots
    {
        title: "Campus Flea Market", type: "Class Project", domain: "Web / App", description: "Second-hand trading app for students.", ownerRole: "frontend",
        roles: [{ role: "frontend", count: 2 }, { role: "backend", count: 2 }, { role: "mobile", count: 2 }, { role: "designer", count: 1 }]
    }, // 7 slots
    {
        title: "Blockchain Voting System", type: "Competition / Hackathon", domain: "Fintech / Business", description: "Decentralized voting for student council.", ownerRole: "devops",
        roles: [{ role: "backend", count: 3 }, { role: "frontend", count: 1 }, { role: "devops", count: 2 }, { role: "planner", count: 1 }]
    }, // 7 slots
    {
        title: "Interactive Media Art Exhibition", type: "Club / Study", domain: "Media Art / Design", description: "Digital art installation using Processing/p5.js.", ownerRole: "media",
        roles: [{ role: "media", count: 3 }, { role: "designer", count: 2 }, { role: "frontend", count: 1 }]
    }, // 6 slots
    {
        title: "Fintech Portfolio Manager", type: "Startup / Pre-startup", domain: "Fintech / Business", description: "Asset management dashboard for students.", ownerRole: "backend",
        roles: [{ role: "backend", count: 2 }, { role: "data", count: 2 }, { role: "frontend", count: 1 }, { role: "planner", count: 1 }]
    }, // 6 slots
    {
        title: "IoT Smart Plant Care", type: "Side Project", domain: "Hardware / IoT", description: "Automated watering system with Arduino.", ownerRole: "devops",
        roles: [{ role: "devops", count: 2 }, { role: "mobile", count: 2 }, { role: "backend", count: 1 }]
    }, // 5 slots
    {
        title: "Indie Rhythm Game", type: "Side Project", domain: "Game Development", description: "Unity-based mobile rhythm game.", ownerRole: "game",
        roles: [{ role: "game", count: 3 }, { role: "media", count: 1 }, { role: "designer", count: 1 }, { role: "marketing", count: 1 }]
    }, // 6 slots
    {
        title: "Study Group Matcher", type: "Class Project", domain: "Web / App", description: "Find study partners based on schedule.", ownerRole: "backend",
        roles: [{ role: "frontend", count: 2 }, { role: "backend", count: 2 }, { role: "planner", count: 1 }, { role: "mobile", count: 1 }]
    }, // 6 slots
    {
        title: "ESG Carbon Footprint Tracker", type: "Competition / Hackathon", domain: "Social / Humanities", description: "Track daily carbon usage.", ownerRole: "planner",
        roles: [{ role: "marketing", count: 2 }, { role: "designer", count: 1 }, { role: "frontend", count: 1 }, { role: "data", count: 1 }]
    }, // 5 slots
    {
        title: "VR Campus Tour", type: "Club / Study", domain: "Media Art / Design", description: "Virtual reality tour of Sogang campus.", ownerRole: "media",
        roles: [{ role: "media", count: 2 }, { role: "game", count: 2 }, { role: "designer", count: 1 }]
    }, // 5 slots
    {
        title: "Used Book Auction", type: "Startup / Pre-startup", domain: "Web / App", description: "Real-time auction for textbooks.", ownerRole: "backend",
        roles: [{ role: "backend", count: 3 }, { role: "frontend", count: 2 }, { role: "devops", count: 1 }]
    }, // 6 slots
    {
        title: "Language Exchange Social", type: "Side Project", domain: "Social / Humanities", description: "Connect with exchange students.", ownerRole: "marketing",
        roles: [{ role: "marketing", count: 2 }, { role: "mobile", count: 2 }, { role: "planner", count: 1 }]
    }, // 5 slots
    {
        title: "DevOps CI/CD Pipeline Study", type: "Club / Study", domain: "Web / App", description: "Learning Jenkins, Docker, K8s.", ownerRole: "devops",
        roles: [{ role: "devops", count: 4 }, { role: "backend", count: 2 }]
    }, // 6 slots
    {
        title: "Mobile RPG 'Sogang Quest'", type: "Competition / Hackathon", domain: "Game Development", description: "RPG game featuring school mascot.", ownerRole: "game",
        roles: [{ role: "game", count: 3 }, { role: "media", count: 2 }, { role: "planner", count: 1 }]
    }, // 6 slots
    {
        title: "Crypto Wallet Tracker", type: "Startup / Pre-startup", domain: "Fintech / Business", description: "Manage diverse crypto assets.", ownerRole: "frontend",
        roles: [{ role: "frontend", count: 2 }, { role: "backend", count: 2 }, { role: "data", count: 1 }]
    }, // 5 slots
    {
        title: "Smart Home Dashboard", type: "Side Project", domain: "Hardware / IoT", description: "Control smart devices from web.", ownerRole: "mobile",
        roles: [{ role: "mobile", count: 2 }, { role: "backend", count: 2 }, { role: "designer", count: 1 }]
    }, // 5 slots
    {
        title: "Fashion Trend Analysis", type: "Class Project", domain: "AI / Data Science", description: "Crawling Instagram to find trends.", ownerRole: "data",
        roles: [{ role: "data", count: 3 }, { role: "backend", count: 1 }, { role: "marketing", count: 1 }]
    }, // 5 slots
    {
        title: "Music Collaboration Tool", type: "Side Project", domain: "Media Art / Design", description: "Real-time jamming web app.", ownerRole: "media",
        roles: [{ role: "media", count: 2 }, { role: "frontend", count: 2 }, { role: "backend", count: 2 }]
    }, // 6 slots
    {
        title: "Startup Networking Event", type: "Club / Study", domain: "Social / Humanities", description: "Organizing networking for founders.", ownerRole: "marketing",
        roles: [{ role: "marketing", count: 3 }, { role: "planner", count: 2 }, { role: "designer", count: 1 }]
    } // 6 slots
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
        await Notification.deleteMany({});

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
        for (let i = 0; i < PROJECTS_DATA.length; i++) {
            const p = PROJECTS_DATA[i];

            // Find a suitable owner based on ownerRole
            const potentialOwners = createdUsers.filter(u => {
                const userProfile = USERS_DATA.find(ud => ud.email === u.email);
                return userProfile && userProfile.role === p.ownerRole;
            });
            const owner = potentialOwners[Math.floor(Math.random() * potentialOwners.length)] || createdUsers[0];

            // Candidates (exclude owner)
            const candidates = createdUsers.filter(u => u._id.toString() !== owner._id.toString());

            const project = new Project({
                title: p.title,
                oneLineDescription: p.description,
                type: p.type,
                domain: p.domain,
                description: p.description + '\n\nLooking for passionate teammates to join our journey.',
                owner: owner._id,
                status: (i < 15) ? 'OPEN' : 'CONFIRMED', // Mix statuses
                roles: p.roles.map(r => ({ ...r, filled: 0 })), // Initialize filled count
                members: [{ user: owner._id, role: p.ownerRole }]
            });

            // Calculate total slots defined in roles
            const totalProjectSlots = project.roles.reduce((acc, r) => acc + r.count, 0);

            // Logic: Target 5-7 members (including owner) to ensure users get 2-4 memberships
            // Randomly select 4 to 6 additional members (making total 5-7 members)
            let targetAdditionalCount = 4 + Math.floor(Math.random() * 3); // 4, 5, 6

            // Cap at avail capacity (Total slots - 1 for owner)
            if (targetAdditionalCount > (totalProjectSlots - 1)) {
                targetAdditionalCount = totalProjectSlots - 1;
            }

            const selectedMembers = candidates.sort(() => 0.5 - Math.random()).slice(0, targetAdditionalCount);

            // Count Owner's role first
            const ownerRoleObj = project.roles.find(r => r.role === p.ownerRole);
            if (ownerRoleObj) {
                if (ownerRoleObj.filled < ownerRoleObj.count) {
                    ownerRoleObj.filled += 1;
                }
            }

            // Add selected members
            for (const m of selectedMembers) {
                // Find roles that are NOT full
                const availableRoles = project.roles.filter(r => r.filled < r.count);

                if (availableRoles.length === 0) break;

                // Get the primary role of the current member from USERS_DATA
                const memberProfileData = USERS_DATA.find(ud => ud.email === m.email);
                const memberPrimaryRole = memberProfileData ? memberProfileData.role : null;

                let chosenRoleObj = null;

                // Try to match user's primary role first
                if (memberPrimaryRole) {
                    chosenRoleObj = availableRoles.find(r => r.role === memberPrimaryRole);
                }

                // If no match or primary role not found, pick a random available role
                if (!chosenRoleObj) {
                    chosenRoleObj = availableRoles[Math.floor(Math.random() * availableRoles.length)];
                }

                project.members.push({ user: m._id, role: chosenRoleObj.role });
                chosenRoleObj.filled += 1;
            }

            await project.save();
            createdProjects.push(project);
        }
        console.log(`${createdProjects.length} Projects created (sizes 5-7).`);

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

        // 4. Coverage Guarantee: Ensure NO user is isolated
        console.log('Verifying coverage...');

        // A. Project Coverage
        for (const user of createdUsers) {
            const isMember = await Project.exists({ 'members.user': user._id });
            if (!isMember) {
                // Force assign to a random project
                const randomProject = await Project.findOne({ status: 'OPEN' }); // simple pick, can be optimized
                if (randomProject) {
                    // Just add as Member role if no specific fit, or simplified logic
                    // Try to match role if possible
                    const userProfile = USERS_DATA.find(ud => ud.email === user.email);
                    let roleToAssign = userProfile ? userProfile.role : 'Member';

                    // Check if role exists in project
                    const hasRole = randomProject.roles.find(r => r.role === roleToAssign);
                    if (!hasRole) roleToAssign = randomProject.roles[0].role; // Fallback

                    randomProject.members.push({ user: user._id, role: roleToAssign });

                    // Update count if tracking strictly (optional for seed redundancy but good practice)
                    const rObj = randomProject.roles.find(r => r.role === roleToAssign);
                    if (rObj) rObj.filled += 1;

                    await randomProject.save();
                    console.log(`Force-assigned ${user.name} to project ${randomProject.title}`);
                }
            }
        }

        // B. Friend Coverage
        for (const user of createdUsers) {
            const hasFriend = await Friendship.exists({ users: user._id });
            if (!hasFriend) {
                // Force friend someone
                const rando = createdUsers.find(u => u._id.toString() !== user._id.toString());
                const fs = new Friendship({ users: [user._id, rando._id] });
                await fs.save();
                console.log(`Force-friended ${user.name} with ${rando.name}`);
            }
        }

        console.log('--- SEED COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
