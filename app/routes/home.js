//import modules
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');

router.get("/", async (req, res) => {
    if(!req.session.username) {
        const numStudents = await User.countDocuments({ position: 'student' });
        const numAlumni = await User.countDocuments({ position: 'alumni' });
        const numStaffParents = await User.countDocuments({ position: { $in: ['staff', 'parent'] } });
        res.render(path.join(__dirname, '../views', 'landing.ejs'), {
            numStudents,
            numAlumni,
            numStaffParents
        });
    } else {
        res.redirect('/directory');
    }
})

module.exports = router;