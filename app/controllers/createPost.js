//import modules
const Post = require('../models/Post');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

exports.createPost = async (req, res) => {
    const { title, content, tags } = req.body;
    const author = req.session.username;

    try {
        const post = await Post.create({
            author,
            title,
            content: sanitizeHtml(content),
            tags: tags.split(',').map(tag => tag.trim())
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