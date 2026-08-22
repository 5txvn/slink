//import modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function sendAboutPage(req, res) {
    const aboutPath = path.join(__dirname, 'app/views/about.ejs');
    ejs.renderFile(aboutPath, {}, (err, html) => {
        if (err) {
            console.error('Error rendering about page:', err);
            return res.status(500).send('Error loading about page');
        }
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.send(html);
    });
}

app.get('/about', sendAboutPage);
app.get('/About', sendAboutPage);

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

const passport = require('./app/config/passport');
app.use(passport.initialize());

//db setup
const db = require('./app/config/db');
db();

//import and use controllers
const logOutUser = require('./app/controllers/logOutUser');
app.get('/logout', logOutUser.logOutUser);

app.use('/', require('./app/routes/home'));
app.use('/authenticate', require('./app/routes/authenticate'));
app.use('/google-auth', require('./app/routes/googleAuth'));
app.use('/profile', require('./app/routes/profile'));
app.use('/welcome', require('./app/routes/welcome'));
app.use('/directory', require('./app/routes/directory'));
app.use('/user', require('./app/routes/viewUser'));
app.use('/admin', require('./app/routes/admin'));

//forum routes
app.use('/create-post', require('./app/routes/forum/createPost'));
app.use('/forum', require('./app/routes/forum/forum'));
app.use('/post', require('./app/routes/forum/post'));
app.use('/my-posts', require('./app/routes/forum/myPosts'));

//start server
app.listen(process.env.PORT || 8080, () => {
    console.log(`Slink is running on port ${process.env.PORT || 8080}`);
}); 