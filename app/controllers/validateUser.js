//import modules
const User = require('../models/User');
const bcrypt = require('bcrypt');
const path = require('path');

exports.validateUser = async (req, res) => {
    //load user
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    //check if user exists
    if(!user) return res.status(401).render(path.join(__dirname, '../views', 'error.ejs'), {
        title: "Authentication error",
        message: "Invalid username, please try again.",
        redirectUrl: "/authenticate"
    });

    //handle incorrect password
    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(401).render(path.join(__dirname, '../views', 'error.ejs'), {
        title: "Authentication error",
        message: "Invalid password, please try again.",
        redirectUrl: "/authenticate"
    });

    //load user into session
    req.session.username = user.username;
    req.session.email = email;
    res.redirect('/');
}