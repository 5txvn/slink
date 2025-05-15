const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('../../models/Post');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/authenticate');
    }
    next();
};

// GET route to render individual post page
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('comments')
            .exec();

        if (!post) {
            return res.status(404).render(path.join(__dirname, '../../views', 'status.ejs'), {
                status: 'error',
                title: "Post Not Found",
                message: "The post you're looking for doesn't exist.",
                redirectUrl: "/forum"
            });
        }

        res.render(path.join(__dirname, '../../views/forum', 'post.ejs'), {
            post: post,
            currentUser: req.session.username
        });
    } catch (error) {
        return res.status(500).render(path.join(__dirname, '../../views', 'status.ejs'), {
            status: 'error',
            title: "Server Error",
            message: `Error message: ${error.message}`,
            redirectUrl: "/forum"
        });
    }
});

// Add comment to post
router.post('/:id/comment', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = {
            author: req.session.username,
            content: req.body.content,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment' });
    }
});

// Upvote post
router.post('/:id/upvote', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const username = req.session.username;
        const upvoteIndex = post.upvotes.indexOf(username);
        const downvoteIndex = post.downvotes.indexOf(username);

        if (upvoteIndex === -1) {
            post.upvotes.push(username);
            if (downvoteIndex !== -1) {
                post.downvotes.splice(downvoteIndex, 1);
            }
        } else {
            post.upvotes.splice(upvoteIndex, 1);
        }

        await post.save();
        res.json({ 
            upvotes: post.upvotes.length,
            downvotes: post.downvotes.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error upvoting post' });
    }
});

// Downvote post
router.post('/:id/downvote', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const username = req.session.username;
        const upvoteIndex = post.upvotes.indexOf(username);
        const downvoteIndex = post.downvotes.indexOf(username);

        if (downvoteIndex === -1) {
            post.downvotes.push(username);
            if (upvoteIndex !== -1) {
                post.upvotes.splice(upvoteIndex, 1);
            }
        } else {
            post.downvotes.splice(downvoteIndex, 1);
        }

        await post.save();
        res.json({ 
            upvotes: post.upvotes.length,
            downvotes: post.downvotes.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error downvoting post' });
    }
});

module.exports = router; 