import express from 'express';
import { register, login, logout, getUserProfile } from '../controller/userController.js';
import { verifyEmailController } from '../controller/verifyEmail.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

export const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmailController);
router.post("/login", login); //added login routes here

// Session destruction route (requires authentication to log out)
router.post("/logout", protect, logout);
// Protected routes with RBAC (Example for Client/Company profiles)
router.get("/client/profile", protect, restrictTo("client"), getUserProfile);
// Protected routes with RBAC (Example for Freelancer profiles)
router.get("/freelancer/profile", protect, restrictTo("freelancer"), getUserProfile);
