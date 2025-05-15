//import modules
const Post = require('../models/Post');
const path = require('path');

exports.createPost = async (req, res) => {
    const { content, tags } = req.body;
    const author = req.session.username;

    try {
        const post = await Post.create({
            author,
            content,
            tags
        });
        await post.save();
        res.redirect(`/post/${post._id}`);
    } catch (error) {
        return res.status(500).render(path.join(__dirname, '../views', 'error.ejs'), {
            title: "Server error occurred",
            message: `Error message: ${error.message}`,
            redirectUrl: "/createPost"
        });
    }
} 