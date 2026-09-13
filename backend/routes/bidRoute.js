import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { isProjectParticipant } from '../middleware/isProjectParticipant.js';
import {
  placeBid,
  getProjectBids,
  acceptBid,
  editBid,
  withdrawBid,
  rejectBid,
} from '../controller/bidController.js';

const router = express.Router();

// ── PROJECT-SCOPED BID ROUTES (using project :id) ──────────────────────────

// PLACE BID: Freelancer bids on a project
// POST /api/bids/:id/place   (body: { projectId, amount, coverLetter, estimatedDays })
router.post('/:id/place', protect, restrictTo('freelancer'), placeBid);

// GET BIDS: Client views all bids for their project
// GET /api/bids/:id/all
router.get(
  '/:id/all',
  protect,
  restrictTo('client'),
  isProjectParticipant,
  getProjectBids
);

// ACCEPT BID: Client accepts a specific bid (body: { bidId })
// PATCH /api/bids/:id/accept
router.patch(
  '/:id/accept',
  protect,
  restrictTo('client'),
  isProjectParticipant,
  acceptBid
);

// ── BID-SCOPED ROUTES (using bid :bidId) ───────────────────────────────────

// EDIT BID: Freelancer edits their own pending bid
// PUT /api/bids/bid/:bidId
router.put('/bid/:bidId', protect, restrictTo('freelancer'), editBid);

// WITHDRAW BID: Freelancer withdraws their own pending bid
// DELETE /api/bids/bid/:bidId
router.delete('/bid/:bidId', protect, restrictTo('freelancer'), withdrawBid);

// REJECT BID: Client rejects a specific bid
// PATCH /api/bids/bid/:bidId/reject
router.patch('/bid/:bidId/reject', protect, restrictTo('client'), rejectBid);

export default router;
