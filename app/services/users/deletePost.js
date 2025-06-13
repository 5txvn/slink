const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const path = require('path');

exports.deletePost = async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/forum';
        res.redirect('/authenticate');
    }
    try {
        const user = await User.findOne({ username: req.session.username });
        const post = await Post.findById(req.params.id);

        if(!user) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'User Not Found',
            message: 'The user trying to delete the post does not exist.',
            redirectUrl: '/forum'
        });
        if(!post) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Post Not Found',
            message: 'The post you are trying to delete does not exist.',
            redirectUrl: '/forum'
        });
        if(post.author.toString() !== user._id.toString()) res.status(403).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Unauthorized',
            message: 'You are not authorized to delete this post.',
            redirectUrl: '/forum'
        });

        const comments = post.comments;
        for(const comment of comments) {
            await Comment.findByIdAndDelete(comment);
        }
        await post.deleteOne();
        res.status(200).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'success',
            title: 'Post Deleted',
            message: 'The post has been deleted successfully.',
            redirectUrl: '/forum'
        });
    } catch(error) {
        console.error(`Error occurred while deleting post: ${error}`);
        res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while deleting the post, please try again later.',
            redirectUrl: '/forum'
        });
    }
}