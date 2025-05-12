//import modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

//express setup
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

//session setup
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

//db setup
const db = require('./app/config/db');
db();

//import and use controllers
const logOutUser = require('./app/controllers/logOutUser');
app.get('/logout', logOutUser.logOutUser);

//user routes
app.use('/', require('./app/routes/home'));
app.use('/authenticate', require('./app/routes/authenticate'));
app.use('/profile', require('./app/routes/profile'));
app.use('/welcome', require('./app/routes/welcome'));
app.use('/directory', require('./app/routes/directory'));
app.use('/user', require('./app/routes/viewUser'));

//start server
app.listen(process.env.PORT || 3000, () => {
    console.log(`Slink is running on port ${PORT}`);
}); 