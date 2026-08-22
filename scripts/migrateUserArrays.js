require('dotenv').config();
const mongoose = require('mongoose');

function toArray(value) {
    if (Array.isArray(value)) {
        return value
            .map(item => (item == null ? '' : String(item).trim()))
            .filter(item => item && item.toLowerCase() !== 'n/a');
    }
    if (value == null) return [];
    const text = String(value).trim();
    if (!text || text.toLowerCase() === 'n/a') return [];
    return [text];
}

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = mongoose.connection.collection('users');
        const docs = await users.find({}).toArray();
        let updated = 0;

        for (const user of docs) {
            await users.updateOne(
                { _id: user._id },
                {
                    $set: {
                        school: toArray(user.school),
                        major: toArray(user.major),
                        currentPosition: toArray(user.currentPosition),
                        company: toArray(user.company),
                        location: toArray(user.location),
                        admin: user.admin === true
                    }
                }
            );
            updated += 1;
        }

        console.log(`Updated ${updated} user(s): converted profile fields to arrays, replaced n/a with [], and set admin to false where missing.`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Failed to migrate user fields:', error);
        process.exit(1);
    }
})();
