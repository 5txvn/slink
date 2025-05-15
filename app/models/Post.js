const mongoose = require('mongoose');
const Comment = require('./Comment');

const postSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: [true, "Forum post must have a heading, please fill in the heading field."]
    },
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: [true, "Forum post must have content, please fill in the content field."]
    },
    tags: {
        type: [String],
        required: true,
        default: []
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
    comments: {
        type: [Comment],
        required: true,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema); 