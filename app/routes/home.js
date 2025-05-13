const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/", (req, res) => {
    if(!req.session.username) {
        res.render(path.join(__dirname, '../views', 'landing.ejs'));
    } else {
        res.redirect('/directory');
    }
})

module.exports = router;