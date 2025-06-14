const User = require('../models/User');
const path = require('path');

exports.editUser = async (req, res) => {
    const { name, bio, school, major, graduationYear, currentPosition, company, location, linkedin, twitter, instagram, reddit, discord, website } = req.body;
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
                    location,
                    socialLinks: {
                        linkedin,
                        twitter,
                        instagram,
                        reddit,
                        discord,
                        website
                    }
                }
            },
            {
                new: true,
                runValidators: true
            }
        );
        res.status(200).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'success',
            title: 'Profile Updated',
            message: 'Your profile has been updated successfully.',
            redirectUrl: '/profile'
        });
    } catch (error) {
        res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while updating your profile, please try again later.',
            redirectUrl: '/profile'
        });
    }
};