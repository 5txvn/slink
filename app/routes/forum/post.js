//import modules
const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const sanitizeHtml = require('sanitize-html');
const { removeComment } = require('../../services/users/removeComment');
const { deletePost } = require('../../services/users/deletePost');

//load post page
router.get('/:id', async (req, res) => {
    if (!req.session.username) {
        req.session.redirectUrl = `/post/${req.params.id}`;
        return res.redirect('/authenticate');
    } else {
        try {
            //fetch post from db and load error or post page
            const post = await Post.findById(req.params.id).populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    model: 'User'
                }
            }).populate('author').exec();
            if (!post) {
                return res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
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
            return res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'error',
                title: "Internal Server Error",
                message: `An error occurred while loading the post, please try again later.`,
                redirectUrl: "/forum"
            });
        }
    }
});

//add comment to post
router.post('/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const user = await User.findOne({ username: req.session.username });
        if(!user) return res.status(404).json({ message: 'User not found' });

        const newComment = await Comment.create({
            author: user._id,
            content: sanitizeHtml(req.body.content)
        });
        post.comments.push(newComment._id);

        await post.save();
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error(`Error occurred while adding comment: ${error}`);
        res.status(500).json({ message: 'Error adding comment' });
    }
});

//upvote post
router.post('/:id/upvote', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const user = await User.findOne({ username: req.session.username });
        if(!user) return res.status(404).json({ message: 'User not found' });

        const upvoteIndex = post.upvotes.indexOf(user._id);
        const downvoteIndex = post.downvotes.indexOf(user._id);
        if (upvoteIndex === -1) {
            post.upvotes.push(user._id);
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
        console.error(`Error occurred while upvoting post: ${error}`);
        res.status(500).json({ message: 'Error upvoting post' });
    }
});

//downvote post
router.post('/:id/downvote', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const user = await User.findOne({ username: req.session.username });
        if(!user) return res.status(404).json({ message: 'User not found' });

        const upvoteIndex = post.upvotes.indexOf(user._id);
        const downvoteIndex = post.downvotes.indexOf(user._id);
        if (downvoteIndex === -1) {
            post.downvotes.push(user._id);
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
        console.error(`Error occurred while downvoting post: ${error}`);
        res.status(500).json({ message: 'Error downvoting post' });
    }
});

router.post('/:postId/:commentId/remove', removeComment);
router.post('/:id/delete', deletePost);

module.exports = router; 