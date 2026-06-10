import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { isProjectParticipant } from '../middleware/isProjectParticipant.js';
import { placeBid, getProjectBids, acceptBid } from '../controller/bidController.js';

const router = express.Router();

// PLACE BID: Any freelancer can bid on any open project
router.post('/:id/place', protect, restrictTo('freelancer'), placeBid);

// GET BIDS: Only client can see bids for their project
router.get('/:id/all', protect, restrictTo('client'), isProjectParticipant, getProjectBids);

// ACCEPT BID: Only client can accept a bid
router.patch('/:id/accept', protect, restrictTo('client'), isProjectParticipant, acceptBid);

export default router;