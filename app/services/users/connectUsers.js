const User = require('../../models/User');
const path = require('path');

exports.connectUsers = async (req, res) => {
    if(!req.session.username) {
        req.session.redirect = '/';
        res.redirect('/authenticate');
    }

    try {
        const requestingUser = await User.findOne({ username: req.params.username });
        const acceptingUser = await User.findOne({ username: req.session.username });
        console.log(requestingUser.username, acceptingUser.username);
        if(!requestingUser || !acceptingUser) res.status(404).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'User Not Found',
            message: 'You or the user you are trying to connect with does not exist.',
            redirectUrl: '/'
        });

        if(requestingUser.outBoundConnections.findIndex(connection => connection.user.toString() === acceptingUser._id.toString()) !== -1 && acceptingUser.inBoundConnections.findIndex(connection => connection.user.toString() === requestingUser._id.toString()) !== -1) {
            //push ids to connections array and remove ids from outBoundConnections and inBoundConnections arrays
            if(requestingUser.connections.findIndex(connection => connection.user.toString() === acceptingUser._id.toString()) === -1) requestingUser.connections.push({ user: acceptingUser._id });
            if(acceptingUser.connections.findIndex(connection => connection.user.toString() === requestingUser._id.toString()) === -1) acceptingUser.connections.push({ user: requestingUser._id });
            requestingUser.outBoundConnections = requestingUser.outBoundConnections.filter(id => id.user.toString() !== acceptingUser._id.toString());
            acceptingUser.inBoundConnections = acceptingUser.inBoundConnections.filter(id => id.user.toString() !== requestingUser._id.toString());
            await requestingUser.save();
            await acceptingUser.save();
            res.status(200).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'success',
                title: 'Connection Successful',
                message: 'You have successfully connected with this user.',
                redirectUrl: '/'
            });
        } else {
            res.status(400).render(path.join(__dirname, '../../views/utils/status.ejs'), {
                status: 'error',
                title: 'Connection Failed',
                message: 'You are not able to connect with this user.',
                redirectUrl: '/'
            });
        }
    } catch(error) {
        res.status(500).render(path.join(__dirname, '../../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while connecting with this user, please try again later.',
            redirectUrl: '/'
        });
    }
    
}