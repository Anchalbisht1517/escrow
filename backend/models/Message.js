import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // null = unread by the other participant (used in Step 7)
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Chat history is always "messages of one project, newest first, paginated"
messageSchema.index({ project: 1, _id: -1 });

export default mongoose.model('Message', messageSchema);