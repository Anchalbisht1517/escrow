import express from 'express';

import {
  register,
  login,
  logout,
  getUserProfile,
  uploadAvatar,
  deleteAvatar,
  uploadResume,
  deleteResume,
  refresh,
  getMe,
  updateFreelancerProfile,
  updateClientProfile,
} from '../controller/userController.js';

import {
  forgotPassword,
  resetPassword,
} from '../controller/passwordResetController.js';
import { verifyEmailController } from '../controller/verifyEmail.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  uploadAvatar as uploadAvatarMulter,
  uploadResumeLocal,
} from '../config/multerUpload.js';

export const router = express.Router();

router.post('/register', register);
router.get('/verify-email', verifyEmailController);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

router.get('/client/profile', protect, restrictTo('client'), getUserProfile);

router.get(
  '/freelancer/profile',
  protect,
  restrictTo('freelancer'),
  getUserProfile
);

// PUT /api/auth/freelancer/profile — update freelancer's own profile
router.put(
  '/freelancer/profile',
  protect,
  restrictTo('freelancer'),
  updateFreelancerProfile
);

// PUT /api/auth/client/profile — update client's own profile
router.put(
  '/client/profile',
  protect,
  restrictTo('client'),
  updateClientProfile
);

router.post(
  '/avatar',
  protect,
  uploadAvatarMulter.single('avatar'),
  uploadAvatar
);

router.put(
  '/avatar',
  protect,
  uploadAvatarMulter.single('avatar'),
  uploadAvatar
);

router.delete('/deleteAvatar', protect, deleteAvatar);

router.post(
  '/resume',
  protect,
  restrictTo('freelancer'),
  uploadResumeLocal.single('resume'),
  uploadResume
);

router.delete('/resume', protect, restrictTo('freelancer'), deleteResume);
