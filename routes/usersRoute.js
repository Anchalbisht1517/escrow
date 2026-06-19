import express from 'express';
import { getUserPublicProfile, getUserWallet } from '../controller/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/wallet - get balance and transaction history (protected)
router.get('/wallet', protect, getUserWallet);

// GET /api/users/:id/profile - get public profile by ID
router.get('/:id/profile', getUserPublicProfile);

export default router;
