const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { editUser } = require('../controllers/editUser');


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
            res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'error',
                title: 'Internal Server Error',
                message: 'An error occurred while loading the profile page, please try again later.',
                redirectUrl: '/'
            });
        }
    }
});

router.post("/", editUser);

module.exports = router;