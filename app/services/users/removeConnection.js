const User = require('../../models/User');
const path = require('path');

exports.removeConnection = async (req, res) => {
    if(!req.session.username) {
        req.session.redirect = '/';
        res.redirect('/authenticate');
    }
    try {
        const user = await User.findOne({ username: req.session.username });
        const otherUser = await User.findOne({ username: req.params.username });
        if(!user || !otherUser) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'User Not Found',
            message: 'You or the user you are trying to remove a connection from does not exist.',
            redirectUrl: '/'
        });
        user.connections = user.connections.filter(connection => connection.user.toString() !== otherUser._id.toString());
        otherUser.connections = otherUser.connections.filter(connection => connection.user.toString() !== user._id.toString());
        await user.save();
        await otherUser.save();
        res.status(200).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'success',
            title: 'Connection Removed',
            message: 'You have successfully removed your connection with this user.',
            redirectUrl: '/'
        });
    } catch(error) {
        res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while removing the connection, please try again later.',
            redirectUrl: '/'
        });
    }
}