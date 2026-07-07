import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },

    role: {
        type: String,
        enum: ['client', 'freelancer', 'admin'],
        required: true,
        index: true
    },

    walletBalance: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    },

    avgRating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    // ─── Reputation counters (freelancer only) ───
    // Incremented at project lifecycle endpoints — never decremented.
    // completedProjectsCount: +1 when client calls completeProject
    // abandonedProjectsCount: +1 when client cancels a project that was in-progress
    //   (i.e. escrow was locked — a freelancer was actually hired). Open-project
    //   cancellations do NOT count against the freelancer.
    completedProjectsCount: {
        type: Number,
        default: 0
    },

    abandonedProjectsCount: {
        type: Number,
        default: 0
    },

    bio: {
        type: String,
        default: ""
    },

    portfolio: {
        type: [String],
        default: []
    },

    passwordResetToken: {
        type: String,
        index: true
    },

    passwordResetExpires: {
        type: Date
    },

    transactionHistory: [
        {
            amount: { type: Number, required: true },
            type: { type: String, enum: ['credit', 'debit'], required: true },
            description: { type: String, default: "" },
            date: { type: Date, default: Date.now }
        }
    ],

    clientInfo: {
        companyName: String,
        companyDesc: String
    },

    freelancerInfo: {
        skills: {
            type: [String],
            default: []
        },

        bio: {
            type: String,
            default: ""
        },

        experience: {
            type: String,
            default: ""
        },

        hourlyRate: {
            type: Number,
            default: 0
        },

        portfolioLinks: [{
            type: String
        }],

        resume: {
            public_id: {
                type: String,
                default: ""
            },

            url: {
                type: String,
                default: ""
            }
        },

        rating: {
            type: Number,
            default: 0
        },

        reviews: [
            {
                fromUser: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },

                rating: {
                    type: Number,
                    min: 1,
                    max: 5
                },

                comment: {
                    type: String,
                    default: ""
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    isVerified: {
        type: Boolean,
        default: false
    },


    address: String,
    city: String,
    zipCode: String,
    phoneNo: String,

}, { timestamps: true });


userSchema.methods.matchPassword = async function (Password) {
    return await bcrypt.compare(Password, this.password);
};


userSchema.pre('save', async function () {
    if (this.isModified('firstName') || this.isModified('lastName') || !this.name) {
        this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
    }

    // --- Sync duplicate fields: keep top-level and freelancerInfo in sync ---
    // If top-level field was modified this save, it wins and overwrites the nested one.
    // If nested was only modified, it wins and syncs back to top-level on next save.
    if (this.isModified('bio')) {
        if (!this.freelancerInfo) this.freelancerInfo = {};
        this.freelancerInfo.bio = this.bio;
    } else if (this.freelancerInfo && this.freelancerInfo.bio !== this.bio) {
        this.bio = this.freelancerInfo.bio;
    }

    if (this.isModified('avgRating')) {
        if (!this.freelancerInfo) this.freelancerInfo = {};
        this.freelancerInfo.rating = this.avgRating;
    } else if (this.freelancerInfo && this.freelancerInfo.rating !== this.avgRating) {
        this.avgRating = this.freelancerInfo.rating;
    }

    if (!this.isModified('password')) {
        return; // stop password if execution reaches here if password didn't change
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


export default mongoose.model("User", userSchema);