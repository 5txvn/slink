const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { adminDeleteUser } = require('../controllers/deleteUser');
const { adminEditUser } = require('../controllers/adminEditUser');
const { normalizeList } = require('../utils/listFields');
const { LIST_FIELDS } = require('../utils/profileFields');

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

router.get('/edit/:id', async (req, res) => {
    try {
        const admin = await requireAdmin(req, res);
        if (!admin) return;

        const found = await User.findById(req.params.id).select('-password');
        if (!found) {
            return res.status(404).render(path.join(__dirname, '../views/utils/status.ejs'), {
                status: 'error',
                title: 'User Not Found',
                message: 'No account matched that lookup.',
                redirectUrl: '/admin'
            });
        }

        const userData = found.toObject();
        LIST_FIELDS.forEach(field => {
            userData[field] = normalizeList(userData[field]);
        });

        res.render(path.join(__dirname, '../views', 'adminEdit.ejs'), {
            user: JSON.stringify(userData).replace(/</g, '\\u003c'),
            userId: found._id
        });
    } catch (error) {
        res.status(500).render(path.join(__dirname, '../views/utils/status.ejs'), {
            status: 'error',
            title: 'Internal Server Error',
            message: 'An error occurred while loading the account editor, please try again later.',
            redirectUrl: '/admin'
        });
    }
});

router.post('/edit/:id', adminEditUser);
router.post('/delete', adminDeleteUser);

module.exports = router;
