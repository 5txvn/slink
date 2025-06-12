const User = require('../../models/User');
const path = require('path');

exports.addRecentlyViewedUser = async (userId, viewingUserId) => {
    try {
        const viewingUser = await User.findById(viewingUserId);
        const viewedUser = await User.findById(userId);
        if (!viewingUser || !viewedUser) throw new Error('User not found');
        if(viewingUser._id.toString() === viewedUser._id.toString()) return;
        const viewedUserIndex = viewingUser.recentlyViewedUsers.findIndex(user => user.user.toString() === viewedUser._id.toString());
        if(viewedUserIndex !== -1) viewingUser.recentlyViewedUsers.splice(viewedUserIndex, 1);
        viewingUser.recentlyViewedUsers.push({ user: viewedUser._id });
        await viewingUser.save();
    } catch(error) {
        console.error(`Error occurred while adding recently viewed user: ${error}`);
    }
}