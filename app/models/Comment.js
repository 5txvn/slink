const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: [true, "Comment must have content, please fill in the content field."]
    },
    upvotes: {
        type: [String],
        required: true,
        default: []
    },
    downvotes: {
        type: [String],
        required: true,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = commentSchema;