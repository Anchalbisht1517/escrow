import 'dotenv/config';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified',
      data: null,
    });
  } catch (_err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token',
      data: null,
    });
  }
};
