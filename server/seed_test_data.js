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
    { name: 'Kim Min-jun', email: 'minjun@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Web/App', 'AI/Data', 'High Passion', 'Backend'], skills: [{ name: 'Node.js', category: 'Frameworks', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }, { name: 'MongoDB', category: 'Infrastructure', level: 'intermediate' }] },
    { name: 'Lee Seo-yeon', email: 'seoyeon@sogang.ac.kr', role: 'frontend', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Web/App', 'Design', 'Hybrid', 'Frontend'], skills: [{ name: 'React', category: 'Frameworks', level: 'advanced' }, { name: 'CSS/HTML', category: 'Programming', level: 'advanced' }, { name: 'Figma', category: 'Design', level: 'intermediate' }] },
    { name: 'Park Ji-hoo', email: 'jihoo@sogang.ac.kr', role: 'game', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Metaverse', 'Game Dev', 'Offline Preferred'], skills: [{ name: 'Unity', category: 'Frameworks', level: 'advanced' }, { name: 'C#', category: 'Programming', level: 'intermediate' }, { name: 'Blender', category: 'Design', level: 'intermediate' }] },
    { name: 'Choi Yuna', email: 'yuna@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['Startup', 'Fintech', 'Serious & Committed', 'E-commerce'], skills: [{ name: 'Jira', category: 'Other', level: 'intermediate' }, { name: 'Excel', category: 'Other', level: 'advanced' }] },
    { name: 'Jung Ha-rin', email: 'harin@sogang.ac.kr', role: 'devops', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Cloud Computing', 'Hardware', 'Hybrid'], skills: [{ name: 'AWS', category: 'Infrastructure', level: 'advanced' }, { name: 'Docker', category: 'Infrastructure', level: 'intermediate' }] },
    { name: 'Kang Do-hyeon', email: 'dohyeon@sogang.ac.kr', role: 'data', major: 'Convergence Software', college: 'AI/Graduate', tags: ['AI/Data', 'Research', 'Serious & Committed'], skills: [{ name: 'PyTorch', category: 'Frameworks', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'advanced' }] },
    { name: 'Yoon Seo-woo', email: 'seowoo@sogang.ac.kr', role: 'media', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['Media Art', 'Design', 'Have Fun'], skills: [{ name: 'Premiere Pro', category: 'Design', level: 'advanced' }, { name: 'TouchDesigner', category: 'Design', level: 'intermediate' }] },
    { name: 'Lim Joon-young', email: 'joonyoung@sogang.ac.kr', role: 'mobile', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Mobile', 'Flutter', 'High Passion'], skills: [{ name: 'Flutter', category: 'Frameworks', level: 'advanced' }, { name: 'Dart', category: 'Programming', level: 'intermediate' }] },
    { name: 'Han Ji-eun', email: 'jieun@sogang.ac.kr', role: 'marketing', major: 'Global Korean Studies', college: 'Integrated Knowledge', tags: ['Networking', 'Social Media', 'Build Portfolio'], skills: [{ name: 'PowerPoint', category: 'Design', level: 'advanced' }, { name: 'Instagram', category: 'Other', level: 'advanced' }] },
    { name: 'Shin Dong-wook', email: 'dongwook@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Blockchain', 'Security', 'Fintech'], skills: [{ name: 'Solidity', category: 'Programming', level: 'intermediate' }, { name: 'Go', category: 'Programming', level: 'intermediate' }] },

    // 11-20: Design, Media, & Humanities
    { name: 'Alice Kim', email: 'alice@sogang.ac.kr', role: 'designer', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['Design', 'Build Portfolio', 'Web/App'], skills: [{ name: 'Figma', category: 'Design', level: 'advanced' }, { name: 'Adobe XD', category: 'Design', level: 'intermediate' }] },
    { name: 'Bob Park', email: 'bob@sogang.ac.kr', role: 'frontend', major: 'Economics', college: 'Economics', tags: ['Web/App', 'Fintech', 'Startup'], skills: [{ name: 'React', category: 'Frameworks', level: 'intermediate' }, { name: 'JavaScript', category: 'Programming', level: 'advanced' }] },
    { name: 'Charlie Lee', email: 'charlie@sogang.ac.kr', role: 'planner', major: 'Sociology', college: 'Social Sciences', tags: ['Networking', 'Social Media', 'Startup'], skills: [{ name: 'Jira', category: 'Other', level: 'advanced' }, { name: 'Notion', category: 'Other', level: 'advanced' }] },
    { name: 'David Choi', email: 'david@sogang.ac.kr', role: 'backend', major: 'Physics', college: 'Natural Sciences', tags: ['AI/Data', 'Side Project', 'Cloud Computing'], skills: [{ name: 'Python', category: 'Programming', level: 'advanced' }, { name: 'C++', category: 'Programming', level: 'intermediate' }] },
    { name: 'Eve Jung', email: 'eve@sogang.ac.kr', role: 'data', major: 'Mathematics', college: 'Natural Sciences', tags: ['AI/Data', 'Research', 'Hybrid'], skills: [{ name: 'R', category: 'Programming', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'advanced' }] },
    { name: 'Frank Kang', email: 'frank@sogang.ac.kr', role: 'media', major: 'Global Korean Studies', college: 'Integrated Knowledge', tags: ['Media Art', 'Design', 'Have Fun'], skills: [{ name: 'Final Cut', category: 'Design', level: 'advanced' }, { name: 'DaVinci Resolve', category: 'Design', level: 'intermediate' }] },
    { name: 'Grace Yoon', email: 'grace@sogang.ac.kr', role: 'frontend', major: 'French Language and Literature', college: 'Humanities', tags: ['Build Portfolio', 'High Passion', 'Web/App'], skills: [{ name: 'Vue.js', category: 'Frameworks', level: 'intermediate' }, { name: 'HTML/CSS', category: 'Programming', level: 'advanced' }] },
    { name: 'Henry Lim', email: 'henry@sogang.ac.kr', role: 'marketing', major: 'Political Science', college: 'Social Sciences', tags: ['Networking', 'Social Media', 'Startup'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'PPT', category: 'Design', level: 'advanced' }] },
    { name: 'Iris Han', email: 'iris@sogang.ac.kr', role: 'designer', major: 'History', college: 'Humanities', tags: ['Design', 'Media Art', 'Capstone'], skills: [{ name: 'Photoshop', category: 'Design', level: 'advanced' }, { name: 'Illustrator', category: 'Design', level: 'advanced' }] },
    { name: 'Jack Shin', email: 'jack@sogang.ac.kr', role: 'backend', major: 'Chemistry', college: 'Natural Sciences', tags: ['Healthcare', 'Side Project', 'Serious & Committed'], skills: [{ name: 'Java', category: 'Programming', level: 'intermediate' }, { name: 'Spring', category: 'Frameworks', level: 'beginner' }] },

    // 21-30: Varied Mix (New Roles Focus)
    { name: 'Liam Kim', email: 'liam@sogang.ac.kr', role: 'mobile', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Blockchain', 'Fintech', 'Mobile'], skills: [{ name: 'React Native', category: 'Frameworks', level: 'advanced' }, { name: 'Solidity', category: 'Programming', level: 'intermediate' }] },
    { name: 'Noah Park', email: 'noah@sogang.ac.kr', role: 'devops', major: 'Electronic Engineering', college: 'Engineering', tags: ['IoT', 'Hardware', 'Hybrid'], skills: [{ name: 'Kubernetes', category: 'Infrastructure', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }] },
    { name: 'Oliver Lee', email: 'oliver@sogang.ac.kr', role: 'game', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Game Dev', 'Design', 'Media Art'], skills: [{ name: 'Unreal Engine', category: 'Frameworks', level: 'advanced' }, { name: 'C++', category: 'Programming', level: 'intermediate' }] },
    { name: 'Elijah Choi', email: 'elijah@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['Fintech', 'SaaS', 'Startup'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'Tableau', category: 'Other', level: 'intermediate' }] },
    { name: 'James Jung', email: 'james@sogang.ac.kr', role: 'data', major: 'Mathematics', college: 'Natural Sciences', tags: ['AI/Data', 'Research', 'Build Portfolio'], skills: [{ name: 'R', category: 'Programming', level: 'advanced' }, { name: 'SQL', category: 'Programming', level: 'advanced' }] },
    { name: 'William Han', email: 'william@sogang.ac.kr', role: 'media', major: 'Media & Entertainment', college: 'Integrated Knowledge', tags: ['Media Art', 'Design', 'Have Fun'], skills: [{ name: 'Logic Pro', category: 'Design', level: 'advanced' }, { name: 'Pro Tools', category: 'Design', level: 'intermediate' }] },
    { name: 'Benjamin Yoon', email: 'benjamin@sogang.ac.kr', role: 'frontend', major: 'Psychology', college: 'Social Sciences', tags: ['Web/App', 'Design', 'Build Portfolio'], skills: [{ name: 'JavaScript', category: 'Programming', level: 'intermediate' }, { name: 'HTML/CSS', category: 'Programming', level: 'advanced' }] },
    { name: 'Lucas Kang', email: 'lucas@sogang.ac.kr', role: 'backend', major: 'Physics', college: 'Natural Sciences', tags: ['Security', 'Cloud Computing', 'Side Project'], skills: [{ name: 'Python', category: 'Programming', level: 'advanced' }, { name: 'MATLAB', category: 'Other', level: 'intermediate' }] },
    { name: 'Henry Cho', email: 'henry.c@sogang.ac.kr', role: 'designer', major: 'American Culture', college: 'Humanities', tags: ['Design', 'Media Art', 'Hybrid'], skills: [{ name: 'InDesign', category: 'Design', level: 'advanced' }, { name: 'Photoshop', category: 'Design', level: 'intermediate' }] },
    { name: 'Alexander Song', email: 'alex@sogang.ac.kr', role: 'marketing', major: 'Political Science', college: 'Social Sciences', tags: ['Networking', 'Startup', 'High Passion'], skills: [{ name: 'Word', category: 'Other', level: 'advanced' }, { name: 'Notion', category: 'Other', level: 'advanced' }] },

    // 31-40: More new profiles
    { name: 'Emma Hong', email: 'emma@sogang.ac.kr', role: 'mobile', major: 'Chinese Culture', college: 'Humanities', tags: ['Mobile', 'Global Korean Studies', 'Hybrid'], skills: [{ name: 'Flutter', category: 'Frameworks', level: 'intermediate' }, { name: 'Dart', category: 'Programming', level: 'intermediate' }] },
    { name: 'Charlotte Bae', email: 'charlotte@sogang.ac.kr', role: 'backend', major: 'Chemistry', college: 'Natural Sciences', tags: ['Healthcare', 'Research', 'Long-term (6mo+)'], skills: [{ name: 'Python', category: 'Programming', level: 'intermediate' }, { name: 'Excel', category: 'Other', level: 'advanced' }] },
    { name: 'Amelia Go', email: 'amelia@sogang.ac.kr', role: 'data', major: 'Economics', college: 'Economics', tags: ['Fintech', 'AI/Data', 'Side Project'], skills: [{ name: 'Stata', category: 'Other', level: 'advanced' }, { name: 'Python', category: 'Programming', level: 'intermediate' }] },
    { name: 'Sophia Shin', email: 'sophia@sogang.ac.kr', role: 'media', major: 'Communication', college: 'Social Sciences', tags: ['Media Art', 'Social Media', 'Build Portfolio'], skills: [{ name: 'Word', category: 'Other', level: 'advanced' }, { name: 'CMS', category: 'Other', level: 'intermediate' }] },
    { name: 'Isabella Kwon', email: 'isabella@sogang.ac.kr', role: 'designer', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Design', 'IoT', 'Hardware'], skills: [{ name: 'Arduino', category: 'Other', level: 'intermediate' }, { name: 'Processing', category: 'Programming', level: 'intermediate' }] },
    { name: 'Ava Hwang', email: 'ava@sogang.ac.kr', role: 'planner', major: 'Business Administration', college: 'Business Administration', tags: ['Startup', 'E-commerce', 'High Passion'], skills: [{ name: 'Excel', category: 'Other', level: 'advanced' }, { name: 'Slack', category: 'Other', level: 'advanced' }] },
    { name: 'Mia Seo', email: 'mia@sogang.ac.kr', role: 'frontend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Web/App', 'Mobile', 'Side Project'], skills: [{ name: 'Vue.js', category: 'Frameworks', level: 'advanced' }, { name: 'Sass', category: 'Programming', level: 'intermediate' }] },
    { name: 'Evelyn Moon', email: 'evelyn@sogang.ac.kr', role: 'backend', major: 'Computer Science and Engineering', college: 'Engineering', tags: ['Cloud Computing', 'Security', 'Web/App'], skills: [{ name: 'Java', category: 'Programming', level: 'advanced' }, { name: 'Spring Boot', category: 'Frameworks', level: 'advanced' }] },
    { name: 'Harper Ko', email: 'harper@sogang.ac.kr', role: 'data', major: 'Big Data Science', college: 'AI/Graduate', tags: ['AI/Data', 'Research', 'Healthcare'], skills: [{ name: 'PyTorch', category: 'Frameworks', level: 'advanced' }, { name: 'OpenCV', category: 'Other', level: 'intermediate' }] },
    { name: 'Luna Jeon', email: 'luna@sogang.ac.kr', role: 'game', major: 'Art & Technology', college: 'Integrated Knowledge', tags: ['Game Dev', 'Metaverse', 'Metaverse'], skills: [{ name: 'Unity', category: 'Frameworks', level: 'advanced' }, { name: 'C#', category: 'Programming', level: 'intermediate' }] },
];

// 2. Defined 20 Projects
const PROJECTS_DATA = [
    {
        title: "AI Schedule Optimizer", type: ["Side Project"], domain: ["AI/Data", "Web/App"], description: "Automated timetabling using Genetic Algorithms.", ownerRole: "backend",
        roles: [{ role: "frontend", count: 2 }, { role: "backend", count: 2 }, { role: "data", count: 2 }, { role: "designer", count: 1 }]
    },
    {
        title: "Sogang E-Sports Platform", type: ["Startup", "Side Project"], domain: ["Game Dev", "Mobile"], description: "Matching platform for university gamers.", ownerRole: "planner",
        roles: [{ role: "game", count: 3 }, { role: "backend", count: 2 }, { role: "designer", count: 1 }, { role: "marketing", count: 1 }]
    },
    {
        title: "Campus Flea Market", type: ["Class Project", "Capstone"], domain: ["Web/App", "E-commerce"], description: "Second-hand trading app for students.", ownerRole: "frontend",
        roles: [{ role: "frontend", count: 2 }, { role: "backend", count: 2 }, { role: "mobile", count: 2 }, { role: "designer", count: 1 }]
    },
    {
        title: "Blockchain Voting System", type: ["Competition", "Hackathon"], domain: ["Blockchain", "Security"], description: "Decentralized voting for student council.", ownerRole: "devops",
        roles: [{ role: "backend", count: 3 }, { role: "frontend", count: 1 }, { role: "devops", count: 2 }, { role: "planner", count: 1 }]
    },
    {
        title: "Interactive Media Art Exhibition", type: ["Research", "Class Project"], domain: ["Metaverse", "Media Art"], description: "Digital art installation using Processing/p5.js.", ownerRole: "media",
        roles: [{ role: "media", count: 3 }, { role: "designer", count: 2 }, { role: "frontend", count: 1 }]
    },
    {
        title: "Fintech Portfolio Manager", type: ["Startup", "Competition"], domain: ["Fintech", "AI/Data"], description: "Asset management dashboard for students.", ownerRole: "backend",
        roles: [{ role: "backend", count: 2 }, { role: "data", count: 2 }, { role: "frontend", count: 1 }, { role: "planner", count: 1 }]
    },
    {
        title: "IoT Smart Plant Care", type: ["Side Project", "Hackathon"], domain: ["IoT", "Mobile"], description: "Automated watering system with Arduino.", ownerRole: "devops",
        roles: [{ role: "devops", count: 2 }, { role: "mobile", count: 2 }, { role: "backend", count: 1 }]
    },
    {
        title: "Indie Rhythm Game", type: ["Side Project", "Startup"], domain: ["Game Dev", "Mobile"], description: "Unity-based mobile rhythm game.", ownerRole: "game",
        roles: [{ role: "game", count: 3 }, { role: "media", count: 1 }, { role: "designer", count: 1 }, { role: "marketing", count: 1 }]
    },
    {
        title: "Study Group Matcher", type: ["Capstone", "Study Group"], domain: ["Web/App", "Social Media"], description: "Find study partners based on schedule.", ownerRole: "backend",
        roles: [{ role: "frontend", count: 2 }, { role: "backend", count: 2 }, { role: "planner", count: 1 }, { role: "mobile", count: 1 }]
    },
    {
        title: "ESG Carbon Footprint Tracker", type: ["Competition", "Startup"], domain: ["AI/Data", "E-commerce"], description: "Track daily carbon usage.", ownerRole: "planner",
        roles: [{ role: "marketing", count: 2 }, { role: "designer", count: 1 }, { role: "frontend", count: 1 }, { role: "data", count: 1 }]
    },
    {
        title: "VR Campus Tour", type: ["Research", "Study Group"], domain: ["Metaverse", "Game Dev"], description: "Virtual reality tour of Sogang campus.", ownerRole: "media",
        roles: [{ role: "media", count: 2 }, { role: "game", count: 2 }, { role: "designer", count: 1 }]
    },
    {
        title: "Used Book Auction", type: ["Startup", "Side Project"], domain: ["E-commerce", "Web/App"], description: "Real-time auction for textbooks.", ownerRole: "backend",
        roles: [{ role: "backend", count: 3 }, { role: "frontend", count: 2 }, { role: "devops", count: 1 }]
    },
    {
        title: "Language Exchange Social", type: ["Volunteering", "Side Project"], domain: ["Social Media", "Mobile"], description: "Connect with exchange students.", ownerRole: "marketing",
        roles: [{ role: "marketing", count: 2 }, { role: "mobile", count: 2 }, { role: "planner", count: 1 }]
    },
    {
        title: "DevOps CI/CD Pipeline Study", type: ["Study Group", "Research"], domain: ["Cloud Computing", "Security"], description: "Learning Jenkins, Docker, K8s.", ownerRole: "devops",
        roles: [{ role: "devops", count: 4 }, { role: "backend", count: 2 }]
    },
    {
        title: "Mobile RPG 'Sogang Quest'", type: ["Hackathon", "Game Dev"], domain: ["Game Dev", "Mobile"], description: "RPG game featuring school mascot.", ownerRole: "game",
        roles: [{ role: "game", count: 3 }, { role: "media", count: 2 }, { role: "planner", count: 1 }]
    },
    {
        title: "Crypto Wallet Tracker", type: ["Freelance", "Startup"], domain: ["Blockchain", "Fintech"], description: "Manage diverse crypto assets.", ownerRole: "frontend",
        roles: [{ role: "frontend", count: 2 }, { role: "backend", count: 2 }, { role: "data", count: 1 }]
    },
    {
        title: "Smart Home Dashboard", type: ["Side Project", "Hackathon"], domain: ["IoT", "Web/App"], description: "Control smart devices from web.", ownerRole: "mobile",
        roles: [{ role: "mobile", count: 2 }, { role: "backend", count: 2 }, { role: "designer", count: 1 }]
    },
    {
        title: "Fashion Trend Analysis", type: ["Research", "Capstone"], domain: ["AI/Data", "Social Media"], description: "Crawling Instagram to find trends.", ownerRole: "data",
        roles: [{ role: "data", count: 3 }, { role: "backend", count: 1 }, { role: "marketing", count: 1 }]
    },
    {
        title: "Startup Networking Event", type: ["Startup", "Study Group"], domain: ["Enterprise", "SaaS"], description: "Organizing networking for founders.", ownerRole: "marketing",
        roles: [{ role: "marketing", count: 3 }, { role: "planner", count: 2 }, { role: "designer", count: 1 }]
    },
    // --- 10 New Diverse Projects ---
    {
        title: "Sustainability Dashboard", type: ["Side Project"], domain: ["Social Media", "Web/App"], description: "Visualizing campus energy consumption.", ownerRole: "data",
        roles: [{ role: "data", count: 2 }, { role: "frontend", count: 1 }, { role: "designer", count: 1 }, { role: "backend", count: 1 }]
    },
    {
        title: "Language Learning RPG", type: ["Side Project"], domain: ["Game Dev", "EdTech"], description: "Learn Korean through an immersive RPG.", ownerRole: "game",
        roles: [{ role: "game", count: 2 }, { role: "media", count: 2 }, { role: "planner", count: 1 }]
    },
    {
        title: "Student Startup Incubator", type: ["Startup"], domain: ["Enterprise", "Networking"], description: "A platform for student-led ventures.", ownerRole: "planner",
        roles: [{ role: "planner", count: 2 }, { role: "marketing", count: 2 }, { role: "designer", count: 1 }, { role: "backend", count: 1 }]
    },
    {
        title: "Blockchain Credentialing", type: ["Research", "Hackathon"], domain: ["Blockchain", "Security"], description: "Verifying student certifications on-chain.", ownerRole: "backend",
        roles: [{ role: "backend", count: 2 }, { role: "devops", count: 1 }, { role: "frontend", count: 1 }]
    },
    {
        title: "AR History Tour", type: ["Research", "Side Project"], domain: ["Metaverse", "Media Art"], description: "History of Sogang through AR.", ownerRole: "media",
        roles: [{ role: "media", count: 2 }, { role: "designer", count: 2 }, { role: "mobile", count: 1 }]
    },
    {
        title: "Healthy Dining App", type: ["Side Project", "Startup"], domain: ["Web/App", "Healthcare"], description: "Nutrition tracking for campus meals.", ownerRole: "mobile",
        roles: [{ role: "mobile", count: 2 }, { role: "backend", count: 1 }, { role: "designer", count: 1 }, { role: "marketing", count: 1 }]
    },
    {
        title: "Open Source Contributor Hub", type: ["Study Group"], domain: ["Web/App", "SaaS"], description: "Gamifying open-source contributions.", ownerRole: "frontend",
        roles: [{ role: "frontend", count: 3 }, { role: "backend", count: 2 }, { role: "planner", count: 1 }]
    },
    {
        title: "AI Mental Health Chatbot", type: ["Research", "Side Project"], domain: ["AI/Data", "Healthcare"], description: "Supportive AI for student well-being.", ownerRole: "data",
        roles: [{ role: "data", count: 2 }, { role: "backend", count: 1 }, { role: "designer", count: 1 }]
    },
    {
        title: "Local Commerce Bridge", type: ["Startup", "Freelance"], domain: ["Web/App", "Fintech"], description: "Connecting local shops with students.", ownerRole: "backend",
        roles: [{ role: "backend", count: 2 }, { role: "marketing", count: 2 }, { role: "frontend", count: 1 }]
    },
    {
        title: "Cloud Infrastructure Workshop", type: ["Study Group"], domain: ["Cloud Computing", "Security"], description: "Hands-on experience with modern cloud stacks.", ownerRole: "devops",
        roles: [{ role: "devops", count: 3 }, { role: "backend", count: 2 }]
    },
    {
        title: "Music Collaboration Tool", type: ["Side Project", "Hackathon"], domain: ["Cloud Computing", "Mobile"], description: "Real-time jamming web app.", ownerRole: "media",
        roles: [{ role: "media", count: 2 }, { role: "frontend", count: 2 }, { role: "backend", count: 2 }]
    }
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

        // 2. Create Projects & Assign Members (Balanced Capacity: 3-4 members per 4-7 slots)
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
                status: (i < 20) ? 'OPEN' : 'CONFIRMED', // Mix statuses
                currentStatus: (i < 10) ? "Initial planning phase" : (i < 20) ? "Recruiting teammates" : "Working on prototype",
                roles: p.roles.map(r => ({ ...r, filled: 0 })), // Initialize filled count
                members: [{ user: owner._id, role: p.ownerRole }]
            });

            // Calculate total slots defined in roles
            const totalProjectSlots = project.roles.reduce((acc, r) => acc + r.count, 0);

            // Logic: Target 3-4 members (including owner)
            // Occupancy ratio: 3/4=75% to 4/7=57% -> averages around 60%, fulfilling "half-full" request.
            let targetAdditionalCount = 2 + Math.floor(Math.random() * 2); // 2 or 3 additional members

            // Cap at available capacity (Total slots - 1 for owner)
            if (targetAdditionalCount > (totalProjectSlots - 1)) {
                targetAdditionalCount = totalProjectSlots - 1;
            }

            const selectedMembers = candidates.sort(() => 0.5 - Math.random()).slice(0, targetAdditionalCount);

            // Count Owner's role
            const ownerRoleObj = project.roles.find(r => r.role === p.ownerRole);
            if (ownerRoleObj) {
                ownerRoleObj.filled = 1;
            }

            // Add selected members
            for (const m of selectedMembers) {
                const availableRoles = project.roles.filter(r => r.filled < r.count);
                if (availableRoles.length === 0) break;

                const memberProfileData = USERS_DATA.find(ud => ud.email === m.email);
                const memberPrimaryRole = memberProfileData ? memberProfileData.role : null;

                let chosenRoleObj = null;
                if (memberPrimaryRole) {
                    chosenRoleObj = availableRoles.find(r => r.role === memberPrimaryRole);
                }
                if (!chosenRoleObj) {
                    chosenRoleObj = availableRoles[Math.floor(Math.random() * availableRoles.length)];
                }

                project.members.push({ user: m._id, role: chosenRoleObj.role });
                chosenRoleObj.filled += 1;
            }

            await project.save();
            createdProjects.push(project);
        }
        console.log(`${createdProjects.length} Projects created (sizes 3-4).`);

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
                    // Try to match role if possible
                    const userProfile = USERS_DATA.find(ud => ud.email === user.email);
                    let roleToAssign = userProfile ? userProfile.role : 'Member';

                    // Check if role exists in project
                    let rObj = randomProject.roles.find(r => r.role === roleToAssign);
                    if (!rObj) {
                        rObj = randomProject.roles[0];
                        roleToAssign = rObj.role;
                    }

                    // If role is full, bump the count to accommodate the force-assigned member
                    if (rObj.filled >= rObj.count) {
                        rObj.count = rObj.filled + 1;
                    }

                    randomProject.members.push({ user: user._id, role: roleToAssign });
                    rObj.filled += 1;

                    await randomProject.save();
                    console.log(`Force-assigned ${user.name} to project ${randomProject.title} (Increased capacity if needed)`);
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
