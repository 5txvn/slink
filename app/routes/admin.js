const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { adminDeleteUser } = require('../controllers/deleteUser');

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function requireAdmin(req, res) {
    if (!req.session.username) {
        req.session.redirectUrl = '/admin';
        res.redirect('/authenticate');
        return null;
    }

    const admin = await User.findOne({ username: req.session.username });
    if (!admin || !admin.admin) {
        res.status(403).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'warning',
            title: 'Access Denied',
            message: 'You do not have permission to access this page.',
            redirectUrl: '/'
        });
        return null;
    }

    return admin;
}

router.get('/', async (req, res) => {
    try {
        const admin = await requireAdmin(req, res);
        if (!admin) return;

        const query = String(req.query.q || '').trim();
        let users = [];

        if (query) {
            const clauses = [
                { username: new RegExp(escapeRegex(query), 'i') },
                { name: new RegExp(escapeRegex(query), 'i') },
                { email: new RegExp(escapeRegex(query), 'i') }
            ];
            if (/^[a-fA-F0-9]{24}$/.test(query)) {
                clauses.push({ _id: query });
            }
            users = await User.find({ $or: clauses })
                .select('-password')
                .sort({ name: 1 })
                .limit(50);
        }

        res.render(path.join(__dirname, '../views', 'admin.ejs'), {
            query,
            users
        });
    } catch (error) {
        res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while loading the admin page, please try again later.',
            redirectUrl: '/'
        });
    }
});

router.post('/delete', adminDeleteUser);

module.exports = router;
