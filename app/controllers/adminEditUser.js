const path = require('path');
const User = require('../models/User');
const { LIST_FIELDS, parseArrayField, validateSocialLink, validateDiscord } = require('../utils/profileFields');

exports.adminEditUser = async (req, res) => {
    if (!req.session.username) {
        req.session.redirectUrl = '/admin';
        return res.redirect('/authenticate');
    }

    try {
        const admin = await User.findOne({ username: req.session.username });
        if (!admin || !admin.admin) {
            return res.status(403).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'warning',
                title: 'Access Denied',
                message: 'You do not have permission to access this page.',
                redirectUrl: '/'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'error',
                title: 'User Not Found',
                message: 'No account matched that lookup.',
                redirectUrl: '/admin'
            });
        }

        const {
            name,
            username,
            email,
            bio,
            school,
            major,
            graduationYear,
            currentPosition,
            company,
            location,
            interests,
            extracurriculars,
            linkedin,
            instagram,
            discord,
            website,
            position
        } = req.body;

        const linkedinResult = validateSocialLink('LinkedIn', linkedin, ['linkedin.com']);
        const instagramResult = validateSocialLink('Instagram', instagram, ['instagram.com']);
        const websiteResult = validateSocialLink('website', website);
        const discordResult = validateDiscord(discord);
        const invalid = [linkedinResult, instagramResult, websiteResult, discordResult].find(result => !result.ok);
        if (invalid) {
            return res.status(400).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'error',
                title: 'Could Not Save Details',
                message: invalid.message,
                redirectUrl: `/admin/edit/${user._id}`
            });
        }

        const nextUsername = String(username || '').trim().toLowerCase();
        const nextEmail = String(email || '').trim().toLowerCase();
        if (nextUsername && nextUsername !== user.username) {
            const taken = await User.findOne({ username: nextUsername, _id: { $ne: user._id } });
            if (taken) {
                return res.status(409).render(path.join(__dirname, '../views/utils/status.ejs'), {
                    status: 'error',
                    title: 'Could Not Save Details',
                    message: 'That username is already taken.',
                    redirectUrl: `/admin/edit/${user._id}`
                });
            }
            user.username = nextUsername;
        }
        if (nextEmail && nextEmail !== user.email) {
            const taken = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
            if (taken) {
                return res.status(409).render(path.join(__dirname, '../views/utils/status.ejs'), {
                    status: 'error',
                    title: 'Could Not Save Details',
                    message: 'That email is already taken.',
                    redirectUrl: `/admin/edit/${user._id}`
                });
            }
            user.email = nextEmail;
        }

        if (name != null && String(name).trim()) {
            user.name = String(name).trim();
        }

        if (bio != null) {
            const trimmedBio = String(bio).replace(/^\s+|\s+$/g, '');
            const isEmpty = !trimmedBio || ['n/a', 'no bio yet...'].includes(trimmedBio.toLowerCase());
            user.bio = isEmpty ? 'No bio yet...' : trimmedBio;
        }

        user.school = parseArrayField(school);
        user.major = parseArrayField(major);
        user.currentPosition = parseArrayField(currentPosition);
        user.company = parseArrayField(company);
        user.location = parseArrayField(location);
        user.interests = parseArrayField(interests);
        user.extracurriculars = parseArrayField(extracurriculars);
        LIST_FIELDS.forEach(field => user.markModified(field));

        const year = parseInt(graduationYear, 10);
        if (Number.isFinite(year) && year >= 1900 && year <= 2100) {
            user.graduationYear = year;
        }

        if (['alumni', 'student', 'staff', 'parent'].includes(position)) {
            user.position = position;
        }

        user.admin = req.body.admin === 'true' || req.body.admin === 'on';
        user.socialLinks.linkedin = linkedinResult.stored;
        user.socialLinks.instagram = instagramResult.stored;
        user.socialLinks.discord = discordResult.stored;
        user.socialLinks.website = websiteResult.stored;

        await user.save();

        if (String(admin._id) === String(user._id)) {
            req.session.username = user.username;
            req.session.email = user.email;
        }

        return res.status(200).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'success',
            title: 'Account Updated',
            message: `@${user.username} has been updated successfully.`,
            redirectUrl: `/admin/edit/${user._id}`
        });
    } catch (error) {
        return res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while updating the account, please try again later.',
            redirectUrl: '/admin'
        });
    }
};
