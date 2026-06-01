import express from 'express';
import { register } from '../controller/userController.js';
import { verifyEmailController } from '../controller/verifyEmail.js';

export const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmailController);
router.post("/login", login); //added login routes here




