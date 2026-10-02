import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true, // stored in rupees, not paise
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    description: {
      type: String,
    },

    // ─── ESCROW LEDGER ───
    // Set when this transaction is part of the escrow flow.
    // null for regular wallet top-ups (razorpay).
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },

    // Describes the specific escrow event that created this transaction.
    // null for regular wallet top-ups.
    escrowEvent: {
      type: String,
      enum: ['escrow_locked', 'payment_released', 'escrow_refunded', null],
      default: null,
    },

    gateway: {
      type: String,
      enum: ['razorpay', 'manual'],
      required: true,
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs with no razorpayOrderId (manual transactions)
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
