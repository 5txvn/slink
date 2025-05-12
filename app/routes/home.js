const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/", (req, res) => {
    if(!req.session.username) {
        res.render(path.join(__dirname, '../views', 'directory.ejs'));
    } else {
        res.redirect('/dashboard');
    }
})

module.exports = router;