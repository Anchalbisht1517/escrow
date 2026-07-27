import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../emailVerify/verifyEmail.js';
import { generateTokens } from '../utils/generateTokens.js';
import razorpay from '../config/razorpay.js';
import Transaction from '../models/Transaction.js';
import Project from '../models/Project.js';

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory',
        data: null,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'user already exists',
        data: null,
      });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });
    await sendVerificationEmail({ token, email });
    return res.status(200).json({
      success: true,
      message: 'user registred successfully',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is not verified',
        data: null,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null,
      });
    }

    generateTokens(res, user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
// Logout Controller — Stateless Session Destruction by clearing cookies
export const logout = async (req, res) => {
  try {
    // Clear accessToken cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Clear refreshToken cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

// Simple Profile controller to test authentication & roles
export const getUserProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user: req.user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        data: null,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    // Delete old avatar if it exists
    if (user.avatar) {
      const oldPath = user.avatar.replace('/uploads/', 'uploads/');
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    user.avatarPublicId = req.file.filename; // keep for reference
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    if (user.avatar) {
      const filePath = user.avatar.replace('/uploads/', 'uploads/');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.avatar = '';
    user.avatarPublicId = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume uploaded',
        data: null,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    // Delete old resume if exists
    if (user.freelancerInfo?.resume?.url) {
      const oldPath = user.freelancerInfo.resume.url.replace(
        '/uploads/',
        'uploads/'
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.freelancerInfo.resume = {
      public_id: req.file.filename,
      url: `/uploads/resumes/${req.file.filename}`,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { resume: user.freelancerInfo.resume },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
export const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    if (user.freelancerInfo?.resume?.url) {
      const filePath = user.freelancerInfo.resume.url.replace(
        '/uploads/',
        'uploads/'
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.freelancerInfo.resume = {
      public_id: '',
      url: '',
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is missing',
        data: null,
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
        data: null,
      });
    }

    generateTokens(res, user._id);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: null,
    });
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      data: null,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Current user data retrieved successfully',
      data: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getUserPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -transactionHistory -passwordResetToken -passwordResetExpires'
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    // Compute completionRate only for freelancers who have project history
    const completed = user.completedProjectsCount ?? 0;
    const abandoned = user.abandonedProjectsCount ?? 0;
    const total = completed + abandoned;
    const completionRate =
      total === 0 ? null : Math.round((completed / total) * 100);

    return res.status(200).json({
      success: true,
      message: 'User public profile retrieved successfully',
      data: {
        user,
        completedProjectsCount: completed,
        abandonedProjectsCount: abandoned,
        completionRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getUserWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'walletBalance transactionHistory'
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'User wallet details retrieved successfully',
      data: {
        walletBalance: user.walletBalance,
        transactionHistory: user.transactionHistory || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

// ─── TOP UP WALLET (Client only — manual/fake top-up for dev, replaced by Razorpay later) ───
export const topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive amount is required',
        data: null,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found', data: null });
    }

    user.walletBalance += amount;
    user.transactionHistory.push({
      amount,
      type: 'credit',
      description: `Wallet top-up of ₹${amount}`,
      date: new Date(),
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Wallet topped up successfully. New balance: ₹${user.walletBalance}`,
      data: { walletBalance: user.walletBalance },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── WITHDRAW FROM WALLET (Freelancer only — manual for now, Razorpay Payout later) ───
export const withdrawFromWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive amount is required',
        data: null,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found', data: null });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Available: ₹${user.walletBalance}`,
        data: null,
      });
    }

    user.walletBalance -= amount;
    user.transactionHistory.push({
      amount,
      type: 'debit',
      description: `Withdrawal of ₹${amount} to bank account`,
      date: new Date(),
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Withdrawal of ₹${amount} initiated. New balance: ₹${user.walletBalance}`,
      data: { walletBalance: user.walletBalance },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── CREATE RAZORPAY ORDER (Client only — Step 1 of top-up flow) ───
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive amount (minimum ₹1) is required',
        data: null,
      });
    }

    // Razorpay expects amount in paise (₹1 = 100 paise)
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `w_${req.user._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
    });

    // Record a pending transaction — will be updated to 'success' after payment verification
    await Transaction.create({
      user: req.user._id,
      amount, // stored in rupees
      type: 'credit',
      status: 'pending',
      description: 'Wallet top-up via Razorpay',
      gateway: 'razorpay',
      razorpayOrderId: order.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order.id,
        amount, // in rupees — frontend displays this
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── VERIFY RAZORPAY PAYMENT (Client only — Step 2 of top-up flow) ───
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          'razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required',
        data: null,
      });
    }

    // Verify HMAC signature — prevents fake payment callbacks
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark transaction as failed before returning
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed — invalid signature',
        data: null,
      });
    }

    // Find the pending transaction for this order
    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found for this order',
        data: null,
      });
    }

    // Idempotency guard — prevent double credit if verify is called twice
    if (transaction.status === 'success') {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed',
        data: null,
      });
    }

    // All checks passed — credit the wallet
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found', data: null });
    }

    // Update transaction record
    transaction.status = 'success';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    await transaction.save();

    // Credit wallet and push to embedded history
    user.walletBalance += transaction.amount;
    user.transactionHistory.push({
      amount: transaction.amount,
      type: 'credit',
      description: `Wallet top-up via Razorpay (Payment ID: ${razorpay_payment_id})`,
      date: new Date(),
    });
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified and wallet credited successfully',
      data: { newBalance: user.walletBalance },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── RAZORPAY WEBHOOK (No auth — Razorpay calls this directly) ───
// IMPORTANT: This route must use express.raw() in server.js (before express.json())
// so that req.body arrives as a raw Buffer for correct HMAC verification.
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing webhook signature',
        data: null,
      });
    }

    // req.body is a raw Buffer when express.raw() is used on this route
    const rawBody = req.body.toString();

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
        data: null,
      });
    }

    const event = JSON.parse(rawBody);

    // Only handle payment.captured — ignore all other events
    if (event.event !== 'payment.captured') {
      return res.status(200).json({ success: true, message: 'Event ignored' });
    }

    const orderId = event.payload?.payment?.entity?.order_id;
    if (!orderId) {
      return res
        .status(200)
        .json({ success: true, message: 'No order ID in payload' });
    }

    const transaction = await Transaction.findOne({ razorpayOrderId: orderId });

    // If not found or already credited — return 200 silently
    // Razorpay retries webhooks on non-200, so always return 200 when there is nothing to do
    if (!transaction || transaction.status === 'success') {
      return res
        .status(200)
        .json({ success: true, message: 'Already processed or not found' });
    }

    // Credit the wallet
    const user = await User.findById(transaction.user);
    if (!user) {
      return res
        .status(200)
        .json({ success: true, message: 'User not found — skipped' });
    }

    const paymentId = event.payload.payment.entity.id;

    transaction.status = 'success';
    transaction.razorpayPaymentId = paymentId;
    await transaction.save();

    user.walletBalance += transaction.amount;
    user.transactionHistory.push({
      amount: transaction.amount,
      type: 'credit',
      description: `Wallet top-up via Razorpay webhook (Payment ID: ${paymentId})`,
      date: new Date(),
    });
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    // Always return 200 to stop Razorpay retry loop, log the error server-side
    console.error('Razorpay webhook error:', error.message);
    return res.status(200).json({ success: true, message: 'Webhook received' });
  }
};

// ─── UPDATE FREELANCER PROFILE (Freelancer only) ───
export const updateFreelancerProfile = async (req, res) => {
  try {
    const {
      // top-level contact fields
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phoneNo,
      // freelancer-specific nested fields
      skills,
      bio,
      hourlyRate,
      experience,
      portfolioLinks,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found', data: null });
    }

    // Whitelist — only update fields that were actually sent
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (zipCode !== undefined) user.zipCode = zipCode;
    if (phoneNo !== undefined) user.phoneNo = phoneNo;

    if (skills !== undefined) user.freelancerInfo.skills = skills;
    if (bio !== undefined) user.freelancerInfo.bio = bio;
    if (hourlyRate !== undefined) user.freelancerInfo.hourlyRate = hourlyRate;
    if (experience !== undefined) user.freelancerInfo.experience = experience;
    if (portfolioLinks !== undefined)
      user.freelancerInfo.portfolioLinks = portfolioLinks;

    // pre('save') hook will auto-sync freelancerInfo.bio → top-level bio
    // and derive user.name from firstName + lastName
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Freelancer profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── UPDATE CLIENT PROFILE (Client only) ───
export const updateClientProfile = async (req, res) => {
  try {
    const {
      // top-level contact fields
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phoneNo,
      // client-specific nested fields
      companyName,
      companyDesc,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found', data: null });
    }

    // Whitelist — only update fields that were actually sent
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (zipCode !== undefined) user.zipCode = zipCode;
    if (phoneNo !== undefined) user.phoneNo = phoneNo;

    if (companyName !== undefined) user.clientInfo.companyName = companyName;
    if (companyDesc !== undefined) user.clientInfo.companyDesc = companyDesc;

    // pre('save') hook will auto-derive user.name from firstName + lastName
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Client profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── SUBMIT REVIEW (Client only — must have a completed project with this freelancer) ───
export const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // 1. Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
        data: null,
      });
    }

    // 2. Find the freelancer
    const freelancer = await User.findById(req.params.id);
    if (!freelancer) {
      return res
        .status(404)
        .json({ success: false, message: 'Freelancer not found', data: null });
    }

    // 3. Confirm target user is actually a freelancer
    if (freelancer.role !== 'freelancer') {
      return res.status(400).json({
        success: false,
        message: 'You can only review freelancers',
        data: null,
      });
    }

    // 4. Verify the client has at least one completed project with this freelancer
    const completedProject = await Project.findOne({
      client: req.user._id,
      hiredFreelancer: freelancer._id,
      status: 'completed',
    });
    if (!completedProject) {
      return res.status(403).json({
        success: false,
        message: 'You can only review freelancers you have worked with',
        data: null,
      });
    }

    // 5. Prevent duplicate reviews from the same client
    const alreadyReviewed = freelancer.freelancerInfo.reviews.some(
      (r) => r.fromUser.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this freelancer',
        data: null,
      });
    }

    // 6. Push the new review
    freelancer.freelancerInfo.reviews.push({
      fromUser: req.user._id,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    });

    // 7. Recalculate avgRating and totalReviews
    const reviews = freelancer.freelancerInfo.reviews;
    freelancer.avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    freelancer.totalReviews = reviews.length;

    // 8. Save — pre('save') hook syncs avgRating → freelancerInfo.rating
    await freelancer.save();

    // 9. Return updated rating stats
    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        avgRating: freelancer.avgRating,
        totalReviews: freelancer.totalReviews,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── GET FREELANCER REVIEWS (Public) ───
export const getFreelancerReviews = async (req, res) => {
  try {
    const freelancer = await User.findById(req.params.id)
      .select('role freelancerInfo avgRating totalReviews')
      .populate({
        path: 'freelancerInfo.reviews.fromUser',
        select: 'firstName lastName avatar',
      });

    if (!freelancer) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found', data: null });
    }

    if (freelancer.role !== 'freelancer') {
      return res.status(400).json({
        success: false,
        message: 'This user is not a freelancer',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: {
        reviews: freelancer.freelancerInfo.reviews,
        avgRating: freelancer.avgRating,
        totalReviews: freelancer.totalReviews,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};
