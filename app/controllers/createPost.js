//import modules
const Post = require('../models/Post');
const User = require('../models/User');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

exports.createPost = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });
        const { title, content, tags } = req.body;
        if(!user) res.status(404).render(path.join(__dirname, '../views/utils/status.ejs'), {
            title: "User Not Found",
            message: "The user trying to create the post does not exist.",
            redirectUrl: "/forum",
            status: "error"
        });
        const post = await Post.create({
            author: user._id,
            title: sanitizeHtml(title),
            content: sanitizeHtml(content),
            tags: tags.split(',').map(tag => sanitizeHtml(tag.trim()))
        });
        await post.save();
        res.redirect(`/post/${post._id}`);
    } catch (error) {
        console.error(`Error occurred while creating post: ${error}`);
        return res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            title: "Internal Server Error",
            message: `An error occurred while creating the post, please try again later.`,
            redirectUrl: "/forum",
            status: "error"
        });
    }
} 