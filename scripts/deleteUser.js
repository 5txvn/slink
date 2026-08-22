require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../app/models/User');
const Post = require('../app/models/Post');
const Comment = require('../app/models/Comment');

const userIdArg = process.argv[2];

if (!userIdArg) {
    console.error('Usage: node scripts/deleteUser.js <userObjectId>');
    process.exit(1);
}

if (!mongoose.Types.ObjectId.isValid(userIdArg)) {
    console.error(`Invalid ObjectId: ${userIdArg}`);
    process.exit(1);
}

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const userId = new mongoose.Types.ObjectId(userIdArg);
        const user = await User.findById(userId);

        if (!user) {
            console.error(`No user found with id ${userIdArg}`);
            await mongoose.disconnect();
            process.exit(1);
        }

        console.log(`Deleting ${user.username} (${userId}) and all references...`);

        const authoredPosts = await Post.find({ author: userId }).select('_id comments');
        const commentsOnAuthoredPosts = authoredPosts.flatMap(post => post.comments);

        if (commentsOnAuthoredPosts.length) {
            const deletedPostComments = await Comment.deleteMany({ _id: { $in: commentsOnAuthoredPosts } });
            console.log(`Deleted ${deletedPostComments.deletedCount} comment(s) on the user's posts`);
        }

        const deletedPosts = await Post.deleteMany({ author: userId });
        console.log(`Deleted ${deletedPosts.deletedCount} post(s) authored by the user`);

        const leftoverComments = await Comment.find({ author: userId }).select('_id');
        const leftoverCommentIds = leftoverComments.map(comment => comment._id);
        if (leftoverCommentIds.length) {
            const pulled = await Post.updateMany(
                {},
                { $pull: { comments: { $in: leftoverCommentIds } } }
            );
            const deletedUserComments = await Comment.deleteMany({ _id: { $in: leftoverCommentIds } });
            console.log(`Removed ${deletedUserComments.deletedCount} leftover comment(s) from ${pulled.modifiedCount} post(s)`);
        }

        const postVotes = await Post.updateMany(
            {},
            { $pull: { upvotes: userId, downvotes: userId } }
        );
        const commentVotes = await Comment.updateMany(
            {},
            { $pull: { upvotes: userId, downvotes: userId } }
        );
        console.log(`Removed the user from ${postVotes.modifiedCount} post vote list(s) and ${commentVotes.modifiedCount} comment vote list(s)`);

        const connectionCleanup = await User.updateMany(
            {},
            {
                $pull: {
                    connections: { user: userId },
                    outBoundConnections: { user: userId },
                    inBoundConnections: { user: userId },
                    recentlyViewedUsers: { user: userId }
                }
            }
        );
        console.log(`Removed the user from connection/recently-viewed arrays on ${connectionCleanup.modifiedCount} user document(s)`);

        await User.deleteOne({ _id: userId });
        console.log(`Deleted user document for ${user.username}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Failed to delete user:', error);
        process.exit(1);
    }
})();
