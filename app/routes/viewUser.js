//import modules
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');

router.get("/:username", async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = `/user/${req.params.username}`;
        res.redirect('/authenticate');
    } else {
        const user = await User.findOne({ username: req.params.username });
        res.render(path.join(__dirname, '../views', 'user.ejs'), {user: JSON.stringify(user)});
    }
})

module.exports = router;