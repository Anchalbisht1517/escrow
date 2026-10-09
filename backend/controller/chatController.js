import mongoose from 'mongoose';
import Message from '../models/Message.js';
import { getChatAccess } from '../utils/chatAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SENDER_FIELDS = 'firstName lastName avatar';

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message, data: null });

// GET /api/chat/:projectId/messages?before=<messageId>&limit=30
export const getMessages = asyncHandler(async (req, res) => {
  const access = await getChatAccess(req.params.projectId, req.user._id);
  if (!access.ok) return fail(res, access.status, access.message);

  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
  const filter = { project: access.project._id };

  if (req.query.before) {
    if (!mongoose.isValidObjectId(req.query.before)) {
      return fail(res, 400, 'Invalid cursor');
    }
    filter._id = { $lt: req.query.before };
  }

  // Fetch one extra document to know whether older messages exist
  const docs = await Message.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate('sender', SENDER_FIELDS)
    .lean();

  const hasMore = docs.length > limit;
  const messages = docs.slice(0, limit).reverse(); // oldest → newest for display

  return res.status(200).json({
    success: true,
    message: 'Messages fetched successfully',
    data: { messages, hasMore, canSend: access.canSend },
  });
});

// POST /api/chat/:projectId/messages   body: { text }
export const sendMessage = asyncHandler(async (req, res) => {
  const access = await getChatAccess(req.params.projectId, req.user._id);
  if (!access.ok) return fail(res, access.status, access.message);

  if (!access.canSend) {
    return fail(res, 403, 'Chat is closed for this project');
  }

  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text) return fail(res, 400, 'Message cannot be empty');
  if (text.length > 2000) {
    return fail(res, 400, 'Message cannot exceed 2000 characters');
  }

  const message = await Message.create({
    project: access.project._id,
    sender: req.user._id,
    text,
  });
  await message.populate('sender', SENDER_FIELDS);

  // Step 4: emit this message to the project's socket room here

  return res.status(201).json({
    success: true,
    message: 'Message sent',
    data: { message },
  });
});