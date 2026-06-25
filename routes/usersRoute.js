import express from 'express';
import { getUserPublicProfile, getUserWallet, topUpWallet, withdrawFromWallet } from '../controller/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/wallet - get balance and transaction history (protected)
router.get('/wallet', protect, getUserWallet);

// POST /api/users/wallet/topup - manual wallet credit, clients only (Razorpay later)
router.post('/wallet/topup', protect, restrictTo('client'), topUpWallet);

// POST /api/users/wallet/withdraw - freelancer requests withdrawal from wallet
router.post('/wallet/withdraw', protect, restrictTo('freelancer'), withdrawFromWallet);

// GET /api/users/:id/profile - get public profile by ID
router.get('/:id/profile', getUserPublicProfile);

export default router;
