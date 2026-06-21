import Bid from '../models/Bid.js';
import Project from '../models/Project.js';

// ─── PLACE A BID (Freelancer only) ───
export const placeBid = async (req, res) => {
    try {
        const { projectId, amount, coverLetter, estimatedDays } = req.body;

        // Check if project exists and is open
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found", data: null });
        }

        if (project.status !== 'open') {
            return res.status(400).json({ success: false, message: "Project is not open for bidding", data: null });
        }

        // Check if freelancer already bid on this project
        const existingBid = await Bid.findOne({
            project: projectId,
            freelancer: req.user._id
        });

        if (existingBid) {
            return res.status(400).json({ success: false, message: "You already placed a bid on this project", data: null });
        }

        const bid = await Bid.create({
            project: projectId,
            freelancer: req.user._id,
            amount,
            coverLetter,
            estimatedDays
        });

        // Increment totalBids on Project
        await Project.findByIdAndUpdate(projectId, { $inc: { totalBids: 1 } });

        return res.status(201).json({
            success: true,
            message: "Bid placed successfully",
            data: { bid }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
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
            message: "Bids retrieved successfully",
            data: { bids }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ─── ACCEPT A BID (Client only) ───
export const acceptBid = async (req, res) => {
    try {
        const { bidId } = req.body;
        const project = req.project; // from isProjectParticipant

        // Only client can accept
        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the client can accept bids", data: null });
        }

        const bid = await Bid.findById(bidId);

        if (!bid || bid.project.toString() !== project._id.toString()) {
            return res.status(404).json({ success: false, message: "Bid not found for this project", data: null });
        }

        // Reject all other bids
        await Bid.updateMany(
            { project: project._id, _id: { $ne: bidId } },
            { status: 'rejected' }
        );

        // Accept this bid
        bid.status = 'accepted';
        await bid.save();

        // Update project
        project.hiredFreelancer = bid.freelancer;
        project.status = 'in-progress';
        project.acceptedBidId = bid._id;
        await project.save();

        return res.status(200).json({
            success: true,
            message: "Bid accepted. Freelancer hired.",
            data: { project, bid }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};