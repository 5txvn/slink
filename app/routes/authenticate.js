//import modules
const express = require('express');
const router = express.Router();
const path = require('path');

//import controllers
const createUser = require('../controllers/createUser');
const validateUser = require('../controllers/validateUser');

router.get('/', (req, res) => {
    res.render(path.join(__dirname, '../views', 'authenticate.ejs'));
});

router.post('/signup', createUser.createUser);
router.post('/login', validateUser.validateUser);

module.exports = router;