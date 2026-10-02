import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from '../controller/notificationController.js';

const router = express.Router();

// GET  /api/notifications           — get all my notifications
router.get('/', protect, getMyNotifications);

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', protect, markAllAsRead);

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', protect, markAsRead);

export default router;
