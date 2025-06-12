//import modules
const User = require('../models/User');
const bcrypt = require('bcrypt');
const path = require('path');

exports.validateUser = async (req, res) => {
    try {
        //load user
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        //check if user exists
        if(!user) return res.status(401).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: "Authentication error",
            message: "Invalid username, please try again.",
            redirectUrl: "/authenticate"
        });

        //handle incorrect password
        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(401).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: "Authentication error",
            message: "Invalid password, please try again.",
            redirectUrl: "/authenticate"
        });

        //load user into session
        req.session.username = user.username;
        req.session.email = email;
        if(req.session.redirectUrl) {
            res.redirect(req.session.redirectUrl);
        } else {
            res.redirect('/');
        }
    } catch(error) {
        console.error(`Error occurred while validating user: ${error}`);
        res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: "Internal Server Error",
            message: "An error occurred while logging in, please try again later.",
            redirectUrl: "/authenticate"
        });
    }
}