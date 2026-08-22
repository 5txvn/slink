//import modules
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { normalizeList } = require('../utils/listFields');

router.get('/', async (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/directory';
        res.redirect('/authenticate');
    } else {
        try {
            const alumniDocs = await User.find({ position: 'alumni' })
                .sort({ name: 1 })
                .lean();
            const alumni = alumniDocs.map(entry => ({
                name: entry.name,
                username: entry.username,
                graduationYear: entry.graduationYear,
                school: normalizeList(entry.school),
                major: normalizeList(entry.major),
                currentPosition: normalizeList(entry.currentPosition),
                company: normalizeList(entry.company),
                location: normalizeList(entry.location)
            }));

            res.render(path.join(__dirname, '../views', 'directory.ejs'), {
                alumni
            });
        } catch (error) {
            console.error('Error fetching alumni:', error);
            res.status(500).send('Error loading directory');
        }
    }
});

module.exports = router;