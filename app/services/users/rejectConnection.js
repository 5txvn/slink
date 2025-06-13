const User = require('../../models/User');
const path = require('path');

exports.rejectConnection = async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/';
        res.redirect('/authenticate');
    }
    try {
        const requestingUser = await User.findOne({ username: req.params.username });
        const rejectingUser = await User.findOne({ username: req.session.username });
        if(!requestingUser || !rejectingUser) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'User Not Found',
            message: 'You or the user you are trying to reject the connection with does not exist.',
            redirectUrl: '/'
        });

        if(requestingUser.outBoundConnections.findIndex(connection => connection.user.toString() === rejectingUser._id.toString()) !== -1 && rejectingUser.inBoundConnections.findIndex(connection => connection.user.toString() === requestingUser._id.toString()) !== -1) {
            requestingUser.outBoundConnections = requestingUser.outBoundConnections.filter(id => id.user.toString() !== rejectingUser._id.toString());
            rejectingUser.inBoundConnections = rejectingUser.inBoundConnections.filter(id => id.user.toString() !== requestingUser._id.toString());
            await requestingUser.save();
            await rejectingUser.save();
            res.status(200).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'success',
                title: 'Connection Rejected',
                message: 'You have successfully rejected the connection with this user.',
                redirectUrl: '/'
            });
        } else {
            res.status(400).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'error',
                title: 'Connection Rejection Failed',
                message: 'You are not able to reject the connection with this user.',
                redirectUrl: '/'
            });
        }

    } catch(error) {
        console.error(`Error occurred while rejecting connection: ${error}`);
        res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while rejecting the connection, please try again later.',
            redirectUrl: '/'
        });
    }
}