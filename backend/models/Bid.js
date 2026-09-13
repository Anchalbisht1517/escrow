import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    estimatedDays: {
      type: Number,
      required: true,
    },

    coverLetter: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent a freelancer from bidding multiple times on the same project
bidSchema.index({ project: 1, freelancer: 1 }, { unique: true });

export default mongoose.model('Bid', bidSchema);
