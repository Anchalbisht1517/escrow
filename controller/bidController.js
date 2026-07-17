import Bid from '../models/Bid.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// ─── PLACE A BID (Freelancer only) ───
export const placeBid = async (req, res) => {
  try {
    const { projectId, amount, coverLetter, estimatedDays } = req.body;

    // Check if project exists and is open
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: 'Project not found', data: null });
    }

    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Project is not open for bidding',
        data: null,
      });
    }

    // Check if freelancer already bid on this project
    const existingBid = await Bid.findOne({
      project: projectId,
      freelancer: req.user._id,
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You already placed a bid on this project',
        data: null,
      });
    }

    const bid = await Bid.create({
      project: projectId,
      freelancer: req.user._id,
      amount,
      coverLetter,
      estimatedDays,
    });

    // 3.7 ─── Auto-increment totalBids on Project when bid is submitted ───
    await Project.findByIdAndUpdate(projectId, { $inc: { totalBids: 1 } });

    return res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: { bid },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── GET ALL BIDS FOR A PROJECT (Client only) ───
export const getProjectBids = async (req, res) => {
  try {
    const project = req.project; // from isProjectParticipant middleware

    const bids = await Bid.find({ project: project._id })
      .populate('freelancer', 'firstName lastName rating')
      .sort({ amount: 1 }); // lowest bid first

    return res.status(200).json({
      success: true,
      message: 'Bids retrieved successfully',
      data: { bids },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── ACCEPT A BID (Client only) ───
export const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.body;
    const project = req.project; // from isProjectParticipant

    // Only client can accept
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the client can accept bids',
        data: null,
      });
    }

    // Cannot accept if escrow is already locked (bid already accepted)
    if (project.escrowStatus === 'locked') {
      return res.status(400).json({
        success: false,
        message:
          'A bid has already been accepted and funds are locked for this project',
        data: null,
      });
    }

    const bid = await Bid.findById(bidId);

    if (!bid || bid.project.toString() !== project._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found for this project',
        data: null,
      });
    }

    // ─── ESCROW LOCK: Check client wallet has sufficient balance ───
    const client = await User.findById(req.user._id);
    if (client.walletBalance < bid.amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance to lock funds. Required: ₹${bid.amount}, Available: ₹${client.walletBalance}. Please top up your wallet first.`,
        data: null,
      });
    }

    // Debit client wallet and record transaction
    client.walletBalance -= bid.amount;
    client.transactionHistory.push({
      amount: bid.amount,
      type: 'debit',
      description: `Escrow locked for project: ${project.title}`,
      date: new Date(),
    });
    await client.save();

    // Reject all other bids
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Update project — lock escrow
    project.hiredFreelancer = bid.freelancer;
    project.status = 'in-progress';
    project.acceptedBidId = bid._id;
    project.escrowAmount = bid.amount;
    project.escrowStatus = 'locked';
    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Bid accepted. Freelancer hired. Escrow funds locked.',
      data: {
        project,
        bid,
        escrow: {
          lockedAmount: bid.amount,
          clientNewBalance: client.walletBalance,
        },
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── EDIT OWN BID (Freelancer only, bid must be pending) ───
// 3.4 - PUT /api/bids/:bidId
export const editBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);

    if (!bid) {
      return res
        .status(404)
        .json({ success: false, message: 'Bid not found', data: null });
    }

    // Only the freelancer who placed the bid can edit it
    if (bid.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You did not place this bid',
        data: null,
      });
    }

    // Can only edit pending bids
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit a bid with status '${bid.status}'. Only pending bids can be edited.`,
        data: null,
      });
    }

    // Whitelist of editable fields
    const allowedFields = ['amount', 'coverLetter', 'estimatedDays'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        bid[field] = req.body[field];
      }
    });

    await bid.save();

    return res.status(200).json({
      success: true,
      message: 'Bid updated successfully',
      data: { bid },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── WITHDRAW BID (Freelancer only) ───
// 3.5 - DELETE /api/bids/:bidId
export const withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);

    if (!bid) {
      return res
        .status(404)
        .json({ success: false, message: 'Bid not found', data: null });
    }

    // Only the freelancer who placed the bid can withdraw it
    if (bid.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You did not place this bid',
        data: null,
      });
    }

    // Cannot withdraw an already accepted or rejected or withdrawn bid
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw a bid with status '${bid.status}'`,
        data: null,
      });
    }

    bid.status = 'withdrawn';
    await bid.save();

    // Decrement totalBids on the project since the bid is effectively removed
    await Project.findByIdAndUpdate(bid.project, { $inc: { totalBids: -1 } });

    return res.status(200).json({
      success: true,
      message: 'Bid withdrawn successfully',
      data: { bid },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── REJECT A SPECIFIC BID (Client only) ───
// 3.6 - PATCH /api/bids/:bidId/reject
export const rejectBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('project');

    if (!bid) {
      return res
        .status(404)
        .json({ success: false, message: 'Bid not found', data: null });
    }

    // Only the client who owns the project can reject bids
    if (bid.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the project owner can reject bids',
        data: null,
      });
    }

    // Can only reject pending bids
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a bid with status '${bid.status}'`,
        data: null,
      });
    }

    bid.status = 'rejected';
    await bid.save();

    return res.status(200).json({
      success: true,
      message: 'Bid rejected successfully',
      data: { bid },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};
