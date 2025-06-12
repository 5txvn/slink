//import modules
const User = require('../models/User');
const bcrypt = require('bcrypt');
const path = require('path');

exports.createUser = async (req, res) => {
    const { name, username, email, password, position } = req.body;

    const existingUser = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });

    //check if user already exists
    if(existingUser) return res.status(409).render(path.join(__dirname, '../views/utils/status.ejs'), {
        status: 'error',
        title: "User error",
        message: "Username or email already exists, please try using a different username or email.",
        redirectUrl: "/authenticate"
    });

    try {
        //create user and save to db
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            position
        });

        await user.save();
        req.session.username = username;
        req.session.email = email;
        res.redirect('/welcome');
    } catch (error) {
        console.error(`Error occurred while creating user: ${error}`);
        return res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: "Internal Server Error",
            message: `An error occurred while creating your account, please try again later.`,
            redirectUrl: "/authenticate"
        });
    }
}
