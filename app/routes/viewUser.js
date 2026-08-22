//import modules
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { addRecentlyViewedUser } = require('../services/users/addRecentlyViewedUser');
const { sendConnectionRequest } = require('../services/users/sendConnenctionRequest');
const { normalizeList } = require('../utils/listFields');

router.get('/', (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = "/user";
        res.redirect('/authenticate');
    }
    res.redirect(`/user/${req.session.username}`);
})

router.get("/:username", async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = `/user/${req.params.username}`;
        res.redirect('/authenticate');
    }
    try {
        const user = await User.findOne({ username: req.params.username });
        const viewingUser = await User.findOne({ username: req.session.username });
        if(!user) res.status(404).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'User Not Found',
            message: 'The user you are trying to view does not exist.',
            redirectUrl: '/'
        });
        await addRecentlyViewedUser(user._id, viewingUser._id);
        const userData = user.toObject();
        ['school', 'major', 'currentPosition', 'company', 'location'].forEach(field => {
            userData[field] = normalizeList(userData[field]);
        });
        res.render(path.join(__dirname, '../views', 'user.ejs'), {
            user: JSON.stringify(userData),
            isOwnProfile: viewingUser._id.toString() === user._id.toString()
        });
    } catch(error) {
        console.error(`Error occurred while loading user page: ${error}`);
        res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while loading the user page, please try again later.',
            redirectUrl: '/'
        });
    }
});

router.post('/:username/connect', sendConnectionRequest);

module.exports = router;