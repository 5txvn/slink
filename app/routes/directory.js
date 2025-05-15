//import modules
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');

router.get('/', async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/directory';
        res.redirect('/authenticate');
    } else {
        try {
            const alumni = await User.find({ position: 'alumni' })
                .select('name username school major graduationYear currentPosition company location bio')
                .sort({ name: 1 });
            
            res.render(path.join(__dirname, '../views', 'directory.ejs'), {
                alumni: JSON.stringify(alumni)
            });
        } catch (error) {
            console.error('Error fetching alumni:', error);
            res.status(500).send('Error loading directory');
        }
    }
});

module.exports = router;