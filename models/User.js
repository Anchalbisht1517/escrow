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
        required: true
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

    bio: {
        type: String,
        default: ""
    },

    portfolio: {
        type: [String],
        default: []
    },

    passwordResetToken: {
        type: String
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

    if (!this.isModified('password')) {
        return; // stop password if execution reaches here if password didn't change
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


export default mongoose.model("User", userSchema);