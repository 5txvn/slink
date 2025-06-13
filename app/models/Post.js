const mongoose = require('mongoose');
const Comment = require('./Comment');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Forum post must have a title, please fill in the title field."]
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true,
        default: []
    },
    downvotes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true,
        default: []
    },
    comments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Comment',
        required: true,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema); 