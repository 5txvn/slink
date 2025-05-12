//import modules
const User = require('../models/User');
const path = require('path');

exports.editUser = async (req, res) => {
    const { name, bio, school, major, graduationYear, currentPosition, company, location } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { username: req.session.username },
            {
                $set: {
                    name,
                    bio,
                    school,
                    major,
                    graduationYear: parseInt(graduationYear),
                    currentPosition,
                    company,
                    location
                }
            },
            {
                new: true,
                runValidators: true
            }
        );
        res.redirect('/profile');
    } catch (error) {
        return res.status(500).render(path.join(__dirname, '../views', 'error.ejs'), {
            title: "Server error occured",
            message: `Error message: ${error.message}`,
            redirectUrl: "/profile"
        });
    }
};