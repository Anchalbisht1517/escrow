import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // The user who triggered the notification (optional — system events can be null)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    type: {
      type: String,
      enum: [
        'bid_placed',        // client receives: a freelancer bid on your project
        'bid_accepted',      // freelancer receives: your bid was accepted
        'bid_rejected',      // freelancer receives: your bid was rejected
        'work_submitted',    // client receives: freelancer submitted work for review
        'revision_requested', // freelancer receives: client requested a revision
        'payment_released',  // freelancer receives: escrow released, payment credited
        'project_cancelled', // freelancer receives: project cancelled and escrow refunded
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Link to the relevant project
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
