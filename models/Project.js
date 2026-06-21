import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    // ─── OWNERSHIP ───
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    hiredFreelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },

    // ─── TIER 1: PUBLIC INFO ───
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    budgetMin: {
        type: Number,
        required: true
    },

    budgetMax: {
        type: Number,
        required: true
    },

    budgetType: {
        type: String,
        enum: ['fixed', 'hourly'],
        required: true
    },

    skillsRequired: {
        type: [String],
        default: []
    },

    deadline: {
        type: Date
    },

    totalBids: {
        type: Number,
        default: 0
    },

    acceptedBidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
        default: null,
        index: true
    },

    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled'],
        default: 'open',
        index: true
    },

    // ─── TIER 2: PRIVATE INFO ───
    // This object is NULL until a freelancer is hired
    privateDetails: {
        contractDocument: {
            public_id: String,
            url: String
        },
        milestoneTracker: {
            public_id: String,
            url: String
        },
        companyInternalNotes: {
            type: String,
            default: ""
        },
        nda: {
            public_id: String,
            url: String
        }
    }

}, { timestamps: true });

export default mongoose.model('Project', projectSchema);