const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const editUser = require('../controllers/editUser');


// Profile page route
router.get('/', async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/profile';
        res.redirect('/authenticate');
    } else {
        try {
            const user = await User.findOne({username: req.session.username}).select('-password -email');
            res.render(path.join(__dirname, '../views', 'profile.ejs'), { user: JSON.stringify(user) });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            //TODO: add error page
            res.status(500).send('Error loading profile');
        }
    }
});

router.post("/", editUser.editUser);

module.exports = router;