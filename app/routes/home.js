//import modules
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { connectUsers } = require('../services/users/connectUsers');
const { rejectConnection } = require('../services/users/rejectConnection');
const { removeConnection } = require('../services/users/removeConnection');
const { cancelOutgoingConnection } = require('../services/users/cancelOutgoingConnection');

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 604800;
    if (interval > 1) return Math.floor(interval) + 'w ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return Math.floor(seconds) + 's ago';
}

router.get("/", async (req, res) => {
    if(!req.session.username) {
        const numStudents = await User.countDocuments({ position: 'student' });
        const numAlumni = await User.countDocuments({ position: 'alumni' });
        const numStaffParents = await User.countDocuments({ position: { $in: ['staff', 'parent'] } });
        res.render(path.join(__dirname, '../views', 'landing.ejs'), {
            numStudents,
            numAlumni,
            numStaffParents
        });
    } else {
        try {
            const user = await User.findOne({ username: req.session.username }).populate('recentlyViewedUsers.user').populate('connections.user').populate('inBoundConnections.user').populate('outBoundConnections.user');
            if(!user) res.redirect('/authenticate');
            //fetch all most recently viewed users and sort them from most recently viewed to least recently viewed
            const recentlyViewedUsers = user.recentlyViewedUsers.sort((a, b) => b.viewedAt - a.viewedAt);
            //fetch all connections and sort them from most recently connected to least recently connected
            const connections = user.connections.sort((a, b) => b.viewedAt - a.viewedAt);
            res.render(path.join(__dirname, '../views', 'home.ejs'), {
                name: user.name,
                recentlyViewedUsers,
                connections,
                connectionRequests: user.inBoundConnections,
                outgoingConnections: user.outBoundConnections,
                formatTimeAgo
            });
        } catch(error) {
            console.error(`Error occurred while loading home page: ${error}`);
            res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'error',
                title: 'Internal Server Error',
                message: 'An error occurred while loading the home page, please try again later.',
                redirectUrl: '/'
            });
        }
    }
})

router.post('/accept-connection/:username', connectUsers);
router.post('/reject-connection/:username', rejectConnection);
router.post('/remove-connection/:username', removeConnection);
router.post('/cancel-connection/:username', cancelOutgoingConnection);

module.exports = router;