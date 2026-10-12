import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getMessages, sendMessage } from '../controller/chatController.js';

const router = express.Router();

// Authorization (participant + hired) is enforced by getChatAccess in the controller
router.get(
  '/:projectId/messages',
  protect,
  restrictTo('client', 'freelancer'),
  getMessages
);

router.post(
  '/:projectId/messages',
  protect,
  restrictTo('client', 'freelancer'),
  sendMessage
);

export default router;
