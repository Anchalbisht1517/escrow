import Project from '../models/Project.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// ─── HELPER: create a notification without blocking the response ───
const notify = async ({ recipient, sender = null, type, message, project = null }) => {
  try {
    await Notification.create({ recipient, sender, type, message, project });
  } catch (err) {
    console.error('Notification creation failed silently:', err.message);
  }
};

// ─── CREATE PROJECT (Client only) ───
export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      budgetMin,
      budgetMax,
      budgetType,
      skillsRequired,
      deadline,
    } = req.body;

    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      budgetMin,
      budgetMax,
      budgetType,
      skillsRequired,
      deadline,
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── GET PUBLIC PROJECT INFO (Any authenticated user) ───
export const getPublicProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .select('-privateDetails')
      .populate('client', 'firstName lastName clientInfo')
      .populate('hiredFreelancer', 'firstName lastName');

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: 'Project not found', data: null });
    }

    return res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: { project },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── GET PRIVATE PROJECT INFO (Client or hired freelancer only) ───
// Note: isProjectParticipant middleware attaches req.project, so no need to query again
export const getPrivateProject = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Private project details retrieved successfully',
      data: { project: req.project },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── LIST ALL OPEN PROJECTS WITH PAGINATION & FILTERING (Public browsing) ───
// Query params: skills (comma-separated), budgetMin, budgetMax, search, page, limit
export const listProjects = async (req, res) => {
  try {
    const {
      skills,
      budgetMin,
      budgetMax,
      search,
      status,
      hiredFreelancer,
      client,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    } else if (!hiredFreelancer && !client) {
      filter.status = 'open';
    }

    if (hiredFreelancer) {
      filter.hiredFreelancer = hiredFreelancer;
    }

    if (client) {
      filter.client = client;
    }

    // Filter by required skills (any match)
    if (skills) {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillsArray.length > 0) {
        filter.skillsRequired = { $in: skillsArray };
      }
    }

    // Filter by budget range (overlap: project budgetMin <= query budgetMax AND project budgetMax >= query budgetMin)
    if (budgetMin !== undefined || budgetMax !== undefined) {
      if (budgetMin !== undefined) {
        filter.budgetMax = { ...filter.budgetMax, $gte: Number(budgetMin) };
      }
      if (budgetMax !== undefined) {
        filter.budgetMin = { ...filter.budgetMin, $lte: Number(budgetMax) };
      }
    }

    // Full-text search on title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .select('-privateDetails')
        .populate('client', 'firstName lastName clientInfo')
        .populate('hiredFreelancer', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Project.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Projects listed successfully',
      data: {
        projects,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── EDIT PROJECT (Client owner only, status must be 'open') ───
// 3.1 - PUT /api/projects/:id
export const editProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: 'Project not found', data: null });
    }

    // Only the client who created the project can edit it
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the project owner can edit it',
        data: null,
      });
    }

    // Can only edit open projects
    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Only open projects can be edited',
        data: null,
      });
    }

    // Whitelist of editable fields
    const allowedFields = [
      'title',
      'description',
      'budgetMin',
      'budgetMax',
      'budgetType',
      'skillsRequired',
      'deadline',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── CANCEL PROJECT (Client owner only) ───
// If escrow is locked, refund the client before cancelling.
export const cancelProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: 'Project not found', data: null });
    }

    // Only the project's client can cancel it
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the project owner can cancel it',
        data: null,
      });
    }

    // Cannot cancel if already cancelled or completed
    if (project.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Project is already cancelled',
        data: null,
      });
    }

    if (project.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed projects cannot be cancelled',
        data: null,
      });
    }

    // ─── ESCROW REFUND: If funds were locked, refund the client ───
    // Also penalise the hired freelancer's reputation — this was an in-progress
    // project (escrow only locks after acceptBid), so the freelancer is accountable.
    if (project.escrowStatus === 'locked' && project.escrowAmount > 0) {
      const client = await User.findById(project.client);
      if (client) {
        client.walletBalance += project.escrowAmount;
        client.transactionHistory.push({
          amount: project.escrowAmount,
          type: 'credit',
          description: `Escrow refunded for cancelled project: ${project.title}`,
          date: new Date(),
        });
        await client.save();
        project.escrowStatus = 'refunded';
      }

      // Reputation: only in-progress cancellations count against the freelancer.
      // Open-project cancellations (no hired freelancer) skip this block entirely.
      if (project.hiredFreelancer) {
        const freelancer = await User.findById(project.hiredFreelancer);
        if (freelancer) {
          freelancer.abandonedProjectsCount += 1;
          await freelancer.save();
        }
      }
    }

    // Mark all pending bids as rejected before cancelling
    await Bid.updateMany(
      { project: project._id, status: 'pending' },
      { status: 'rejected' }
    );

    project.status = 'cancelled';
    await project.save();

    return res.status(200).json({
      success: true,
      message:
        'Project cancelled successfully' +
        (project.escrowStatus === 'refunded'
          ? '. Escrow funds refunded to your wallet.'
          : ''),
      data: { project },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── COMPLETE PROJECT (Client only) ───
// Releases locked escrow funds to the hired freelancer.
export const completeProject = async (req, res) => {
  try {
    const project = req.project; // from isProjectParticipant middleware

    // Only the client can mark the project as complete
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          'Access denied: Only the project owner can mark it as complete',
        data: null,
      });
    }

    // Project must be in-progress or under-review to complete
    if (project.status !== 'in-progress' && project.status !== 'under-review') {
      return res.status(400).json({
        success: false,
        message: `Project must be 'in-progress' or 'under-review' to complete. Current status: '${project.status}'`,
        data: null,
      });
    }

    // Escrow must be locked
    if (project.escrowStatus !== 'locked' || project.escrowAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No locked escrow funds found for this project',
        data: null,
      });
    }

    // ─── ESCROW RELEASE: Credit the hired freelancer ───
    const freelancer = await User.findById(project.hiredFreelancer);
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Hired freelancer not found',
        data: null,
      });
    }

    freelancer.walletBalance += project.escrowAmount;
    freelancer.transactionHistory.push({
      amount: project.escrowAmount,
      type: 'credit',
      description: `Payment received for project: ${project.title}`,
      date: new Date(),
    });
    // Reputation: completed project counts towards freelancer's track record
    freelancer.completedProjectsCount += 1;
    await freelancer.save();

    // Update project
    project.status = 'completed';
    project.escrowStatus = 'released';
    await project.save();

    // Notify freelancer that payment has been released
    await notify({
      recipient: freelancer._id,
      sender: req.user._id,
      type: 'payment_released',
      message: `Payment of ₹${project.escrowAmount} has been released for "${project.title}".`,
      project: project._id,
    });

    return res.status(200).json({
      success: true,
      message:
        'Project marked as complete. Escrow funds released to the freelancer.',
      data: {
        project,
        escrow: {
          releasedAmount: project.escrowAmount,
          freelancerNewBalance: freelancer.walletBalance,
        },
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── SUBMIT WORK (Hired freelancer only) ───
// Changes project status from in-progress → under-review and notifies the client.
export const submitWork = async (req, res) => {
  try {
    const project = req.project; // from isProjectParticipant middleware

    // Only the hired freelancer can submit work
    if (
      !project.hiredFreelancer ||
      project.hiredFreelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the hired freelancer can submit work',
        data: null,
      });
    }

    // Project must be in-progress to submit
    if (project.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit work: project status is "${project.status}". Must be "in-progress".`,
        data: null,
      });
    }

    project.status = 'under-review';
    project.workSubmittedAt = new Date();
    await project.save();

    // Notify client
    await notify({
      recipient: project.client,
      sender: req.user._id,
      type: 'work_submitted',
      message: `${req.user.firstName} has submitted work on "${project.title}" — please review and approve.`,
      project: project._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Work submitted successfully. The client has been notified.',
      data: { project },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── REQUEST REVISION (Client only) ───
// Sends project back from under-review → in-progress when client is not satisfied.
export const requestRevision = async (req, res) => {
  try {
    const project = req.project; // from isProjectParticipant middleware

    // Only the project client can request revision
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the project owner can request a revision',
        data: null,
      });
    }

    // Project must be under-review
    if (project.status !== 'under-review') {
      return res.status(400).json({
        success: false,
        message: `Cannot request revision: project status is "${project.status}". Must be "under-review".`,
        data: null,
      });
    }

    const { message: revisionNote } = req.body;

    project.status = 'in-progress';
    project.workSubmittedAt = null;
    await project.save();

    // Notify freelancer
    await notify({
      recipient: project.hiredFreelancer,
      sender: req.user._id,
      type: 'revision_requested',
      message: revisionNote
        ? `Client requested a revision on "${project.title}": ${revisionNote}`
        : `Client requested a revision on "${project.title}". Please review and resubmit.`,
      project: project._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Revision requested. The freelancer has been notified.',
      data: { project },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};
