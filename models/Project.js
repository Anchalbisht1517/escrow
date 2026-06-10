import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    // ─── OWNERSHIP ───
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    hiredFreelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
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

    budget: {
        type: Number,
        required: true
    },

    skillsRequired: {
        type: [String],
        default: []
    },

    deadline: {
        type: Date
    },

    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'closed'],
        default: 'open'
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