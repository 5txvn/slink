const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('../../models/Post');

// GET route to render forum page
router.get('/', async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/forum';
        res.redirect('/authenticate');  
    } else {
        try {
            const posts = await Post.find()
                .sort({ createdAt: -1 })
                .populate('comments')
                .exec();

            res.render(path.join(__dirname, '../../views/forum', 'forum.ejs'), {
                posts: posts
            });
        } catch (error) {
            return res.status(500).render(path.join(__dirname, '../views', 'error.ejs'), {
                title: "Server error occurred",
                message: `Error message: ${error.message}`,
                redirectUrl: "/forum"
            });
        }
    }
});

module.exports = router; 