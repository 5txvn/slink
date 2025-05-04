const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    school: {
        type: String,
        required: true
    },
    major: {
        type: String,
        required: true
    },
    graduationYear: {
        type: Number,
        required: true
    },
    currentPosition: String,
    company: String,
    location: String,
    bio: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alumni', alumniSchema); 