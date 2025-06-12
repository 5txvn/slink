//add recentlyViewedUsers, connections, inBoundConnections, and outBoundConnections arrays to all users
const mongoose = require('mongoose');
const User = require('./app/models/User');
const db = require('./app/config/db');

db();

(async() => {
    const users = await User.find({});
    console.log(users)
    console.log(`Found ${users.length} users`);
    for(const user of users) {
        user.recentlyViewedUsers = [];
        user.connections = [];
        user.inBoundConnections = [];
        user.outBoundConnections = [];
        await user.save();
    }
    console.log('Successfully updated all users');
    process.exit(0);
})();