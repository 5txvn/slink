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

function emptySocial(value) {
    const text = value == null ? '' : String(value).trim();
    return !text || text.toLowerCase() === 'n/a';
}

function withProtocol(value) {
    const text = String(value).trim();
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text)) return text;
    return `https://${text}`;
}

function isHttpUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

function hostMatches(value, hosts) {
    const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
    return hosts.some(allowed => host === allowed || host.endsWith(`.${allowed}`));
}

function validateSocialLink(label, value, hosts) {
    if (emptySocial(value)) return { ok: true, stored: 'n/a' };
    const url = withProtocol(value);
    if (!isHttpUrl(url) || (hosts && hosts.length && !hostMatches(url, hosts))) {
        return { ok: false, message: `Could not save details. The ${label} link is not valid.` };
    }
    return { ok: true, stored: url };
}

function validateDiscord(value) {
    if (emptySocial(value)) return { ok: true, stored: 'n/a' };
    const text = String(value).trim();
    const looksLikeUrl = /https?:\/\//i.test(text) || /discord\.(gg|com|app)/i.test(text) || text.includes('/');
    if (looksLikeUrl) {
        return validateSocialLink('Discord', text, ['discord.com', 'discord.gg', 'discordapp.com']);
    }
    if (!/^[a-zA-Z0-9._]{2,32}(#\d{4})?$/.test(text)) {
        return { ok: false, message: 'Could not save details. The Discord link is not valid.' };
    }
    return { ok: true, stored: text };
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
                redirectUrl: '/profile'
            });
        }

        if (name != null && String(name).trim()) {
            user.name = String(name).trim();
        }

        if (bio != null) {
            const trimmedBio = String(bio).trim();
            const isEmpty = !trimmedBio || ['n/a', 'no bio yet...'].includes(trimmedBio.toLowerCase());
            user.bio = isEmpty ? 'No bio yet...' : trimmedBio;
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

        user.socialLinks.linkedin = linkedinResult.stored;
        user.socialLinks.instagram = instagramResult.stored;
        user.socialLinks.discord = discordResult.stored;
        user.socialLinks.website = websiteResult.stored;

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
