import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    Avatar: { type: String, default: "" },
    Avatarpublicid: { type: String, default: "" },

    role: {
        type: String,
        enum: ['client', 'freelancer'],
        required: true
    },

    clientInfo: {
        companyName: String,
        companyDesc: String
    },

    freelancerInfo: {
        skills: {
            type: [String],
            default: []
        },

        portfolio: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            default: 0
        },

        reviews: [
            {
                fromUser: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
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

export default mongoose.model("User", userSchema);