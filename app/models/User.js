const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: n => /\s/.test(n),
            message: "Name must contain a space, don't put a single first/last name."
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: e => /^\S+@\S+\.\S+$/.test(e),
            message: "Email address is not valid."
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: u => /^[a-zA-Z0-9._]{5,15}$/.test(u),
            message: "Username must be between 5 and 15 characters long and contain only letters, numbers, dots, and underscores."
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: p => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(p),
            message: "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character."
        }
    },
    position: {
        type: String,
        required: true,
        validate: {
            validator: p => ["alumni", "student", "staff", "parent"].includes(p),
            message: "Position must be one of the following: alumni, student, staff, or parent."
        }
    },
    school: {
        type: String,
        required: true,
        trim: true,
        default: "n/a"
    },
    major: {
        type: String,
        required: true,
        trim: true,
        default: "n/a"
    },
    graduationYear: {
        type: Number,
        required: true,
        min: [1900, "Graduation year must be later than 1900."],
        default: 1900
    },
    currentPosition: {
        type: String,
        required: true,
        trim: true,
        default: "n/a"
    },
    company: {
        type: String,
        required: true,
        trim: true,
        default: "n/a"
    },
    location: {
        type: String,
        required: true,
        trim: true,
        default: "n/a"
    },
    bio: {
        type: String,
        required: true,
        trim: true,
        default: "n/a"
    },
    socialLinks: {
        linkedin: {
            type: String,
            default: "n/a"
        },
        twitter: {
            type: String,
            default: "n/a"
        },
        instagram: {
            type: String,
            default: "n/a"
        },
        reddit: {
            type: String,
            default: "n/a"
        },
        discord: {
            type: String,
            default: "n/a"
        },
        website: {
            type: String,
            default: "n/a"
        }
    },
    recentlyViewedUsers: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    connections: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            connectedAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    outBoundConnections: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            sentAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    inBoundConnections: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            receivedAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema); 