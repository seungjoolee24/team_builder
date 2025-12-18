const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Project = require('./models/Project');
const Invitation = require('./models/Invitation');
const FriendRequest = require('./models/FriendRequest');
const Friendship = require('./models/Friendship');
const Thread = require('./models/Thread');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
require('dotenv').config();

const usersData = [
    { name: 'Kim Min-jun', email: 'minjun@sogang.ac.kr', college: 'engineering', major: 'Computer Science', role: 'backend' },
    { name: 'Lee Seo-yeon', email: 'seoyeon@sogang.ac.kr', college: 'media_art', major: 'Art & Technology', role: 'designer' },
    { name: 'Park Ji-hoon', email: 'jihoon@sogang.ac.kr', college: 'economics', major: 'Business Administration', role: 'planner' },
    { name: 'Choi Hye-won', email: 'hyewon@sogang.ac.kr', college: 'engineering', major: 'Electronic Engineering', role: 'frontend' },
    { name: 'Jung Do-hyun', email: 'dohyun@sogang.ac.kr', college: 'science', major: 'Mathematics', role: 'data' },
    { name: 'Kang Soo-jin', email: 'soojin@sogang.ac.kr', college: 'social_sciences', major: 'Psychology', role: 'planner' },
    { name: 'Yoon Ha-neul', email: 'haneul@sogang.ac.kr', college: 'media_art', major: 'Media & Entertainment', role: 'media' },
    { name: 'Lim Tae-young', email: 'taeyoung@sogang.ac.kr', college: 'engineering', major: 'Computer Science', role: 'backend' },
    { name: 'Han Ji-eun', email: 'jieun@sogang.ac.kr', college: 'humanities', major: 'Philosophy', role: 'planner' },
    { name: 'Shin Jae-ho', email: 'jaeho@sogang.ac.kr', college: 'economics', major: 'Economics', role: 'data' },
    { name: 'Song Mi-rae', email: 'mirae@sogang.ac.kr', college: 'media_art', major: 'Art & Technology', role: 'designer' },
    { name: 'Kwon Hyuk-jin', email: 'hyukjin@sogang.ac.kr', college: 'engineering', major: 'Mechanical Engineering', role: 'backend' },
    { name: 'Hwang Bo-young', email: 'boyoung@sogang.ac.kr', college: 'science', major: 'Chemistry', role: 'data' },
    { name: 'Ahn Dong-gun', email: 'donggun@sogang.ac.kr', college: 'social_sciences', major: 'Political Science', role: 'planner' },
    { name: 'Ryu Min-ah', email: 'minah@sogang.ac.kr', college: 'media_art', major: 'Media & Entertainment', role: 'frontend' },
    { name: 'Go Sung-min', email: 'sungmin@sogang.ac.kr', college: 'engineering', major: 'Computer Science', role: 'backend' },
    { name: 'Baek So-hee', email: 'sohee@sogang.ac.kr', college: 'humanities', major: 'English Literature', role: 'designer' },
    { name: 'Seo Jung-woo', email: 'jungwoo@sogang.ac.kr', college: 'economics', major: 'Business Administration', role: 'planner' },
    { name: 'Moon Ji-young', email: 'jiyoung@sogang.ac.kr', college: 'science', major: 'Physics', role: 'data' },
    { name: 'Yang Hyun-sik', email: 'hyunsik@sogang.ac.kr', college: 'engineering', major: 'Electronic Engineering', role: 'frontend' }
];

const projectsData = [
    {
        title: 'Sogang Campus Map AR',
        oneLineDescription: 'Augmented Reality map for Sogang University.',
        domain: 'Mobile/AR',
        type: 'Side Project',
        ownerIndex: 0,
        roles: [{ role: 'frontend', count: 2 }, { role: 'backend', count: 1 }, { role: 'designer', count: 1 }]
    },
    {
        title: 'AI Study Planner',
        oneLineDescription: 'Personalized study schedules based on exam dates.',
        domain: 'AI/EdTech',
        type: 'Class Project',
        ownerIndex: 4,
        roles: [{ role: 'data', count: 2 }, { role: 'frontend', count: 1 }, { role: 'planner', count: 1 }]
    },
    {
        title: 'Art&Tech Gallery Web',
        oneLineDescription: 'Virtual exhibition space for student artworks.',
        domain: 'Web/Art',
        type: 'Contest',
        ownerIndex: 1,
        roles: [{ role: 'media', count: 3 }, { role: 'frontend', count: 2 }, { role: 'backend', count: 1 }]
    }
];

async function seed() {
    try {
        console.log('Connecting to URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'undefined');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Clear Data
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Project.deleteMany({});
        await Invitation.deleteMany({});
        await FriendRequest.deleteMany({});
        await Friendship.deleteMany({});
        await Thread.deleteMany({});
        await Message.deleteMany({});
        await Notification.deleteMany({});
        console.log('Cleared existing data');

        // 2. Create Users & Profiles
        const salt = await bcrypt.genSalt(10);
        const password = 'Password123!';
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUsers = [];
        for (const data of usersData) {
            const user = new User({
                name: data.name,
                email: data.email,
                password: hashedPassword
            });
            await user.save();
            createdUsers.push(user);

            const profile = new Profile({
                user: user._id,
                college: data.college,
                major: data.major,
                primaryRole: data.role,
                bio: `Hello, I am ${data.name} from the ${data.major} major. Excited to build great things!`,
                skills: [
                    { category: 'Programming', name: data.role === 'backend' ? 'Node.js' : 'React', level: 'intermediate', experience: 'club-or-contest' },
                    { category: 'Frameworks', name: 'Express', level: 'beginner', experience: 'class-only' }
                ],
                interestDomains: ['AI', 'Web', 'Fintech'],
                preferredProjectTypes: ['Startup', 'Hackathon'],
                collaboration: {
                    weeklyHours: '10-15 hours',
                    workMode: 'hybrid',
                    duration: '3-6 months'
                }
            });
            await profile.save();
        }
        console.log('Created 20 users and profiles');

        // 3. Create Projects
        for (const p of projectsData) {
            const project = new Project({
                title: p.title,
                oneLineDescription: p.oneLineDescription,
                description: `This is a long description for ${p.title}. We are looking for talented students from Sogang!`,
                domain: p.domain,
                type: p.type,
                owner: createdUsers[p.ownerIndex]._id,
                status: 'OPEN',
                roles: p.roles
            });
            await project.save();
        }
        console.log('Created projects');

        console.log('Seeding complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
