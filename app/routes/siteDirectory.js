const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    if(!req.session.username) {
        req.session.redirect = '/site-directory';
        res.redirect('/authenticate');
    } else {
        res.render(path.join(__dirname, '../views', 'siteDirectory.ejs'));
    }
});

module.exports = router;