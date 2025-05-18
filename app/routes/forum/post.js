//import modules
const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('../../models/Post');
const sanitizeHtml = require('sanitize-html');

//load post page
router.get('/:id', async (req, res) => {
    if (!req.session.username) {
        req.session.redirectUrl = `/post/${req.params.id}`;
        return res.redirect('/authenticate');
    } else {
        try {
            //fetch post from db and load error or post page
            const post = await Post.findById(req.params.id).populate('comments').exec();
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
            //handle internal server error
            return res.status(500).render(path.join(__dirname, '../../views', 'status.ejs'), {
                status: 'error',
                title: "Server Error",
                message: `Error message: ${error.message}`,
                redirectUrl: "/forum"
            });
        }
    }
});

//add comment to post
router.post('/:id/comment', async (req, res) => {
    try {
        //check if post exists
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        //push comment to post and save it to db
        const comment = {
            author: req.session.username,
            content: sanitizeHtml(req.body.content),
            createdAt: new Date()
        };
        post.comments.push(comment);
        await post.save();
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        //handle internal server error
        res.status(500).json({ message: 'Error adding comment' });
    }
});

//upvote post
router.post('/:id/upvote', async (req, res) => {
    try {
        //check if post exists
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        //load upvotes and downvotes and add upvote
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

        //save post and return upvotes and downvotes
        await post.save();
        res.json({ 
            upvotes: post.upvotes.length,
            downvotes: post.downvotes.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error upvoting post' });
    }
});

//downvote post
router.post('/:id/downvote', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        //load upvotes and downvotes and add downvote
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

        //save post and return upvotes and downvotes
        await post.save();
        res.json({ 
            upvotes: post.upvotes.length,
            downvotes: post.downvotes.length
        });
    } catch (error) {
        //handle internal server error
        res.status(500).json({ message: 'Error downvoting post' });
    }
});

module.exports = router; 