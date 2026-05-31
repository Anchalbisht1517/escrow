import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    avatar: { type: String, default: "" },
    avatarpublicid: { type: String, default: "" },

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


userSchema.methods.matchPassword = async function (Password) {
  return await bcrypt.compare(Password, this.password);
};


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next(); 
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


export default mongoose.model("User", userSchema);