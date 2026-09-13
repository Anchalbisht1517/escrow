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
