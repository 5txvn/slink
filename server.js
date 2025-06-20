//import modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

//express setup
const app = express();
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
app.use('/about', require('./app/routes/about'));
app.use('/site-directory', require('./app/routes/siteDirectory'));

//forum routes
app.use('/create-post', require('./app/routes/forum/createPost'));
app.use('/forum', require('./app/routes/forum/forum'));
app.use('/post', require('./app/routes/forum/post'));
app.use('/my-posts', require('./app/routes/forum/myPosts'));

//start server
app.listen(process.env.PORT || 8080, () => {
    console.log(`Slink is running on port ${process.env.PORT || 8080}`);
}); 