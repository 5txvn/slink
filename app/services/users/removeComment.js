const Comment = require('../../models/Comment');
const Post = require('../../models/Post');
const User = require('../../models/User');
const path = require('path');

exports.removeComment = async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = `/post/${req.params.postId}`;
        res.redirect('/authenticate');
    }
    try {
        const user = await User.findOne({ username: req.session.username });
        const post = await Post.findById(req.params.postId);
        const userComment = await Comment.findById(req.params.commentId);

        if(!user) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'User Not Found',
            message: 'The user trying to remove the comment from does not exist.',
            redirectUrl: '/'
        });
        if(!post) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Post Not Found',
            message: 'The post you are trying to remove the comment from does not exist.',
            redirectUrl: '/'
        });
        if(!userComment) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Comment Not Found',
            message: 'The comment you are trying to remove does not exist.',
            redirectUrl: `/post/${req.params.postId}`
        });
        if(userComment.author.toString() !== user._id.toString()) res.status(403).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Unauthorized',
            message: 'You are not authorized to remove this comment.',
            redirectUrl: `/post/${req.params.postId}`
        });

        post.comments = post.comments.filter(comment => comment.toString() !== userComment._id.toString());
        await post.save();
        res.status(200).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'success',
            title: 'Comment Removed',
            message: 'The comment has been removed successfully.',
            redirectUrl: `/post/${req.params.postId}`
        });
    } catch(error) {
        console.error(`Error occurred while removing comment: ${error}`);
        res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while removing the comment, please try again later.',
            redirectUrl: `/post/${req.params.postId}`
        });
    }
}