const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('../../models/Post');

router.get('/', async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/my-posts';
        res.redirect('/authenticate');
    } else {
        try {
            const posts = await Post.find({ author: req.session.username }).sort({ createdAt: -1 });
            res.render(path.join(__dirname, '../../views/forum/myPosts.ejs'), { 
                posts,
                username: req.session.username
            });
        } catch (error) {
            res.render('status', {
                status: 'error',
                title: 'Error',
                message: 'Failed to load your posts',
                redirectUrl: '/forum'
            });
        }
    }
});

module.exports = router; 