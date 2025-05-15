const express = require('express');
const router = express.Router();
const path = require('path');
const { createPost } = require('../../controllers/createPost');


router.get('/', (req, res) => {
    if(!req.session.username) {
        req.session.redirectUrl = '/create-post';
        res.redirect('/authenticate');
    } else {
        res.render(path.join(__dirname, '../../views/forum', 'createPost.ejs'));
    }
});

router.post('/', createPost);

module.exports = router; 