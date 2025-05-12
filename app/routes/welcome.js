const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/", async (req, res) => {
    if(!req.session.username) {
        res.redirect('/authenticate');
    } else {
        res.render(path.join(__dirname, '../views', 'welcome.ejs'));
    }
});

module.exports = router;