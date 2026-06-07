import express from "express";

import {
  register,
  login,
  logout,
  getUserProfile,
  uploadAvatar,
  deleteAvatar
} from "../controller/userController.js";

import { verifyEmailController } from "../controller/verifyEmail.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

import { upload } from "../config/avatarUpload.js";
import { resumeUpload} from "../config/resumeUpload.js";
import {uploadResume} from "../controller/userController.js";
import { deleteResume } from "../controller/userController.js";

export const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmailController);
router.post("/login", login);

router.post("/logout", protect, logout);

router.get(
  "/client/profile",
  protect,
  restrictTo("client"),
  getUserProfile
);

router.get(
  "/freelancer/profile",
  protect,
  restrictTo("freelancer"),
  getUserProfile
);

router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

router.put(
  "/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

router.delete(
  "/deleteAvatar",
  protect,
  deleteAvatar
);

router.post(
    "/resume",
    protect,
    restrictTo("freelancer"),
    resumeUpload.single("resume"),
    uploadResume
);

router.delete(
    "/resume",
    protect,
    restrictTo("freelancer"),
    deleteResume
);