const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

// GET route to render forum page
router.get('/', async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/forum';
        res.redirect('/authenticate');  
    } else {
        try {
            const posts = await Post.find().sort({ createdAt: -1 }).populate('comments').populate('author').exec();
            res.render(path.join(__dirname, '../../views/forum/forum.ejs'), {
                posts: posts
            });
        } catch (error) {
            console.error(`Error occurred while loading the forum: ${error}`);
            return res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'error',
                title: "Internal Server Error",
                message: `An error occurred while loading the forum, please try again later.`,
                redirectUrl: "/forum"
            });
        }
    }
});

module.exports = router; 