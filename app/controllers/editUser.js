const path = require('path');
const User = require('../models/User');
const { normalizeList } = require('../utils/listFields');

function parseArrayField(value) {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) return normalizeList(value);
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed || trimmed.toLowerCase() === 'n/a') return [];
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return normalizeList(parsed);
            } catch (error) {
                return normalizeList(trimmed);
            }
        }
        return normalizeList(trimmed);
    }
    return normalizeList(value);
}

function socialValue(value) {
    const text = value == null ? '' : String(value).trim();
    return text || 'n/a';
}

exports.editUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });
        if (!user) {
            req.session.redirectUrl = '/profile';
            return res.redirect('/google-auth');
        }

        const {
            name,
            bio,
            school,
            major,
            graduationYear,
            currentPosition,
            company,
            location,
            linkedin,
            instagram,
            discord,
            website,
            position
        } = req.body;

        if (name != null && String(name).trim()) {
            user.name = String(name).trim();
        }

        if (bio != null) {
            const trimmedBio = String(bio).trim();
            user.bio = trimmedBio || 'n/a';
        }

        user.school = parseArrayField(school);
        user.major = parseArrayField(major);
        user.currentPosition = parseArrayField(currentPosition);
        user.company = parseArrayField(company);
        user.location = parseArrayField(location);
        user.markModified('school');
        user.markModified('major');
        user.markModified('currentPosition');
        user.markModified('company');
        user.markModified('location');

        const year = parseInt(graduationYear, 10);
        if (Number.isFinite(year) && year >= 1900 && year <= 2100) {
            user.graduationYear = year;
        } else if (!user.graduationYear) {
            user.graduationYear = 1900;
        }

        if (['alumni', 'student', 'staff', 'parent'].includes(position)) {
            user.position = position;
        }

        user.socialLinks.linkedin = socialValue(linkedin);
        user.socialLinks.instagram = socialValue(instagram);
        user.socialLinks.discord = socialValue(discord);
        user.socialLinks.website = socialValue(website);

        await user.save();

        return res.status(200).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'success',
            title: 'Profile Updated',
            message: 'Your profile has been updated successfully.',
            redirectUrl: '/profile'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        const message = error && error.message
            ? error.message
            : 'An error occurred while updating your profile, please try again later.';
        return res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Could Not Update Profile',
            message,
            redirectUrl: '/profile'
        });
    }
};
