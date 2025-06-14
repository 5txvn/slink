const User = require('../../models/User');
const path = require('path');

exports.cancelOutgoingConnection = async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = `/`;
        res.redirect('/authenticate');
    }
    try {
        const user = await User.findOne({ username: req.session.username });
        const otherUser = await User.findOne({ username: req.params.username });
        if (!user || !otherUser) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'error',
                title: 'User Not Found',
                message: 'You or the user you are trying to cancel the outgoing connection with does not exist.',
                redirectUrl: '/'
        });
        user.outBoundConnections = user.outBoundConnections.filter(id => id.user.toString() !== otherUser._id.toString());
        otherUser.inBoundConnections = otherUser.inBoundConnections.filter(id => id.user.toString() !== user._id.toString());
        await user.save();
        await otherUser.save();
        res.status(200).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'success',
            title: 'Connection Cancelled',
            message: 'You have successfully cancelled the outgoing connection with this user.',
            redirectUrl: '/'
        });
    } catch(error) {
        console.error(`Error canceling outgoing connection: ${error}`);
        res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while canceling the outgoing connection, please try again later.',
            redirectUrl: '/'
        });
    }
}