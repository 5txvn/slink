//import modules
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

async function removeUser(user) {
    const userId = user._id;
    const authoredPosts = await Post.find({ author: userId }).select('_id comments');
    const commentsOnAuthoredPosts = authoredPosts.flatMap(post => post.comments);

    if (commentsOnAuthoredPosts.length) {
        await Comment.deleteMany({ _id: { $in: commentsOnAuthoredPosts } });
    }

    await Post.deleteMany({ author: userId });

    const leftoverComments = await Comment.find({ author: userId }).select('_id');
    const leftoverCommentIds = leftoverComments.map(comment => comment._id);
    if (leftoverCommentIds.length) {
        await Post.updateMany({}, { $pull: { comments: { $in: leftoverCommentIds } } });
        await Comment.deleteMany({ _id: { $in: leftoverCommentIds } });
    }

    await Post.updateMany({}, { $pull: { upvotes: userId, downvotes: userId } });
    await Comment.updateMany({}, { $pull: { upvotes: userId, downvotes: userId } });
    await User.updateMany({}, {
        $pull: {
            connections: { user: userId },
            outBoundConnections: { user: userId },
            inBoundConnections: { user: userId },
            recentlyViewedUsers: { user: userId }
        }
    });
    await User.deleteOne({ _id: userId });
}

exports.deleteOwnAccount = async (req, res) => {
    const confirmation = String(req.body.username || '').trim().toLowerCase();

    if (!req.session.username) {
        req.session.redirectUrl = '/';
        return res.redirect('/authenticate');
    }

    if (confirmation !== String(req.session.username).toLowerCase()) {
        return res.status(400).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Account Not Deleted',
            message: 'The username you entered did not match your account, so nothing was deleted.',
            redirectUrl: '/'
        });
    }

    try {
        const user = await User.findOne({ username: req.session.username });
        if (!user) {
            return res.status(404).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'error',
                title: 'User Not Found',
                message: 'We could not find an account to delete.',
                redirectUrl: '/'
            });
        }

        await removeUser(user);
        req.session.destroy(() => {
            res.status(200).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'success',
                title: 'Account Deleted',
                message: 'Your account has been deleted successfully.',
                redirectUrl: '/'
            });
        });
    } catch (error) {
        return res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while deleting your account, please try again later.',
            redirectUrl: '/'
        });
    }
};

exports.adminDeleteUser = async (req, res) => {
    if (!req.session.username) {
        req.session.redirectUrl = '/admin';
        return res.redirect('/authenticate');
    }

    try {
        const admin = await User.findOne({ username: req.session.username });
        if (!admin || !admin.admin) {
            return res.status(403).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'warning',
                title: 'Access Denied',
                message: 'You do not have permission to access this page.',
                redirectUrl: '/'
            });
        }

        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'error',
                title: 'User Not Found',
                message: 'No account matched that lookup, so nothing was deleted.',
                redirectUrl: '/admin'
            });
        }

        const deletedUsername = user.username;
        const deletingSelf = String(user.username).toLowerCase() === String(admin.username).toLowerCase();
        await removeUser(user);

        if (deletingSelf) {
            return req.session.destroy(() => {
                res.status(200).render(path.join(__dirname, '../views/utils/status.ejs'), {
                    status: 'success',
                    title: 'Account Deleted',
                    message: 'Your account has been deleted successfully.',
                    redirectUrl: '/'
                });
            });
        }

        return res.status(200).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'success',
            title: 'Account Deleted',
            message: `@${deletedUsername} has been deleted successfully.`,
            redirectUrl: '/admin'
        });
    } catch (error) {
        return res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while deleting the account, please try again later.',
            redirectUrl: '/admin'
        });
    }
};
