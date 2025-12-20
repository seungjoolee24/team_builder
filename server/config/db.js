const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('MongoDB use cached connection');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'teambuilder', // Explicitly set DB name if needed
            bufferCommands: true, // Re-enable buffering to prevent errors if commands are called during connection phase
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        // Throw error so the calling middleware knows we failed
        throw err;
    }
};

module.exports = connectDB;
