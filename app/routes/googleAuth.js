const express = require('express');
const router = express.Router();
const passport = require('passport');
const path = require('path');
const User = require('../models/User');

function googleConfigured() {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function renderStatus(res, statusCode, title, message, redirectUrl = '/') {
    return res.status(statusCode).render(path.join(__dirname, '../views/utils/status.ejs'), {
        status: statusCode >= 400 ? 'error' : 'success',
        title,
        message,
        redirectUrl
    });
}

function suggestUsername(email) {
    let base = (email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (base.length < 5) base = (base + 'user').slice(0, 15);
    if (base.length > 15) base = base.slice(0, 15);
    return base;
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findUserByGoogleOrEmail(googleId, email) {
    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({
        $or: [{ googleId }, { email: normalizedEmail }]
    });
    if (!user) {
        user = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' }
        });
    }
    return user;
}

function googleName(profile) {
    let name = profile.displayName || '';
    if (!/\s/.test(name)) {
        const given = profile.name && profile.name.givenName;
        const family = profile.name && profile.name.familyName;
        name = [given, family].filter(Boolean).join(' ');
    }
    if (!/\s/.test(name)) {
        name = `${name || 'Google'} User`;
    }
    return name;
}

router.get('/', (req, res, next) => {
    if (!googleConfigured()) {
        return renderStatus(
            res,
            503,
            'Google Sign-In Unavailable',
            'Google authentication is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment, then try again.'
        );
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/callback', (req, res, next) => {
    if (!googleConfigured()) {
        return res.redirect('/');
    }

    passport.authenticate('google', { session: false, failureRedirect: '/' }, async (err, profile) => {
        if (err || !profile) {
            return renderStatus(res, 401, 'Google Sign-In Failed', 'We could not sign you in with Google. Please try again.');
        }

        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        if (!email) {
            return renderStatus(res, 400, 'Google Sign-In Failed', 'Your Google account did not provide an email address.');
        }

        try {
            const googleId = profile.id;
            const normalizedEmail = email.toLowerCase();
            const user = await findUserByGoogleOrEmail(googleId, normalizedEmail);

            if (user) {
                if (!user.googleId) {
                    // Avoid full-document validation: leftover password hashes and
                    // other legacy fields can fail validators on save().
                    await User.updateOne(
                        { _id: user._id },
                        { $set: { googleId, email: normalizedEmail } }
                    );
                }
                req.session.username = user.username;
                req.session.email = user.email;
                const redirectUrl = req.session.redirectUrl || '/';
                delete req.session.redirectUrl;
                return req.session.save(() => res.redirect(redirectUrl));
            }

            req.session.googleProfile = {
                googleId,
                name: googleName(profile),
                email: normalizedEmail
            };
            return req.session.save(() => res.redirect('/google-auth/complete'));
        } catch (error) {
            console.error(`Error occurred during Google authentication: ${error}`);
            return renderStatus(res, 500, 'Internal Server Error', 'An error occurred while signing in with Google, please try again later.');
        }
    })(req, res, next);
});

router.get('/complete', (req, res) => {
    if (!req.session.googleProfile) {
        return res.redirect('/');
    }

    const { name, email } = req.session.googleProfile;
    res.render(path.join(__dirname, '../views', 'googleComplete.ejs'), {
        name,
        email,
        suggestedUsername: suggestUsername(email)
    });
});

router.post('/complete', async (req, res) => {
    const googleProfile = req.session.googleProfile;
    if (!googleProfile) {
        return res.redirect('/');
    }

    const { username, position } = req.body;
    if (!username || !/^[a-zA-Z0-9._]{5,15}$/.test(username)) {
        return renderStatus(res, 400, 'Invalid Username', 'Username must be between 5 and 15 characters long and contain only letters, numbers, dots, and underscores.');
    }
    if (!['alumni', 'student', 'staff', 'parent'].includes(position)) {
        return renderStatus(res, 400, 'Invalid Role', 'Please select a valid role to finish creating your account.');
    }

    try {
        const existingAccount = await findUserByGoogleOrEmail(googleProfile.googleId, googleProfile.email);
        if (existingAccount) {
            if (!existingAccount.googleId) {
                await User.updateOne(
                    { _id: existingAccount._id },
                    { $set: { googleId: googleProfile.googleId, email: googleProfile.email } }
                );
            }
            delete req.session.googleProfile;
            req.session.username = existingAccount.username;
            req.session.email = existingAccount.email;
            return req.session.save(() => res.redirect('/'));
        }

        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return renderStatus(res, 409, 'User error', 'Username or email already exists, please try using a different username.');
        }

        const user = await User.create({
            name: googleProfile.name,
            username: username.toLowerCase(),
            email: googleProfile.email,
            googleId: googleProfile.googleId,
            position
        });

        delete req.session.googleProfile;
        req.session.username = user.username;
        req.session.email = user.email;
        return req.session.save(() => res.redirect('/welcome'));
    } catch (error) {
        console.error(`Error occurred while completing Google signup: ${error}`);
        return renderStatus(res, 500, 'Internal Server Error', 'An error occurred while creating your account, please try again later.');
    }
});

module.exports = router;
