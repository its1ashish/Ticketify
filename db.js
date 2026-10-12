
const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is missing');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
};

module.exports = connectDB;
