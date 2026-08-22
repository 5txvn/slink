const User = require('../../models/User');
const path = require('path');

function includesUser(list, userId) {
    const id = String(userId);
    return (list || []).some(item => item.user && String(item.user) === id);
}

exports.sendConnectionRequest = async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/';
        return res.redirect('/authenticate');
    }
    try {
        const outgoingUser = await User.findOne({ username: req.session.username });
        const incomingUser = await User.findOne({ username: req.params.username });
        if(!outgoingUser || !incomingUser) return res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'User Not Found',
            message: 'The user you are trying to connect with does not exist.',
            redirectUrl: '/'
        });
        if(outgoingUser._id.toString() === incomingUser._id.toString()) return res.status(400).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Invalid Request',
            message: 'You cannot send a connection request to yourself.',
            redirectUrl: '/'
        });
        if (includesUser(outgoingUser.connections, incomingUser._id) || includesUser(incomingUser.connections, outgoingUser._id)) {
            return res.status(400).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'error',
                title: 'Already Connected',
                message: 'You are already connected with this user.',
                redirectUrl: `/user/${incomingUser.username}`
            });
        }
        if (includesUser(outgoingUser.outBoundConnections, incomingUser._id) || includesUser(incomingUser.inBoundConnections, outgoingUser._id)) {
            return res.status(400).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'error',
                title: 'Request Already Sent',
                message: 'You have already sent a connection request to this user.',
                redirectUrl: `/user/${incomingUser.username}`
            });
        }
        if (includesUser(outgoingUser.inBoundConnections, incomingUser._id) || includesUser(incomingUser.outBoundConnections, outgoingUser._id)) {
            return res.status(400).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'error',
                title: 'Request Already Received',
                message: 'This user has already sent you a connection request. Accept it from your home page.',
                redirectUrl: '/'
            });
        }
        outgoingUser.outBoundConnections.push({ user: incomingUser._id });
        incomingUser.inBoundConnections.push({ user: outgoingUser._id });
        await outgoingUser.save();
        await incomingUser.save();
        res.status(200).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'success',
            title: 'Connection Request Sent',
            message: 'Your connection request has been sent to this user.',
            redirectUrl: `/user/${incomingUser.username}`
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
