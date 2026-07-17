import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../emailVerify/verifyEmail.js';

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        data: null,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
        data: null,
      });
    }

    // Generate raw token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set reset fields in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send email
    const emailSent = await sendPasswordResetEmail({
      token: resetToken,
      email: user.email,
    });

    if (!emailSent) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Error sending password reset email. Please try again later.',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
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

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        data: null,
      });
    }

    // Hash the URL parameter token to match stored version
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user by token and check if unexpired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
        data: null,
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // triggers pre-save password hashing hook

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
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
