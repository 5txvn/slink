const User = require('../../models/User');
const path = require('path');

exports.sendConnectionRequest = async (req, res) => {
    if(!req.session.username) {
        req.session.redirect = '/';
        res.redirect('/authenticate');
    }
    try {
        const outgoingUser = await User.findOne({ username: req.session.username });
        const incomingUser = await User.findOne({ username: req.params.username });
        if(!outgoingUser || !incomingUser) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'User Not Found',
            message: 'The user you are trying to connect with does not exist.',
            redirectUrl: '/'
        });
        if(outgoingUser.outBoundConnections.findIndex(connection => connection.user.toString() === incomingUser._id.toString()) !== -1 && incomingUser.inBoundConnections.findIndex(connection => connection.user.toString() === outgoingUser._id.toString()) !== -1) res.status(400).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Request Already Sent',
            message: 'You have already sent a connection request to this user.',
            redirectUrl: '/'
        });
        outgoingUser.outBoundConnections.push({ user: incomingUser._id });
        incomingUser.inBoundConnections.push({ user: outgoingUser._id });
        await outgoingUser.save();
        await incomingUser.save();
        res.status(200).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'success',
            title: 'Connection Request Sent',
            message: 'Your connection request has been sent to this user.',
            redirectUrl: '/'
        });
    } catch(error) {
        console.error(`Error occurred while sending connection request: ${error}`);
        res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while sending the connection request, please try again later.',
            redirectUrl: '/'
        });
    }
}