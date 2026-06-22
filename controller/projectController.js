import Project from '../models/Project.js';
import Bid from '../models/Bid.js';

// ─── CREATE PROJECT (Client only) ───
export const createProject = async (req, res) => {
    try {
        const { title, description, budgetMin, budgetMax, budgetType, skillsRequired, deadline } = req.body;

        const project = await Project.create({
            client: req.user._id,
            title,
            description,
            budgetMin,
            budgetMax,
            budgetType,
            skillsRequired,
            deadline
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: { project }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ─── GET PUBLIC PROJECT INFO (Any authenticated user) ───
export const getPublicProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .select('-privateDetails')
            .populate('client', 'firstName lastName companyName')
            .populate('hiredFreelancer', 'firstName lastName');

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found", data: null });
        }

        return res.status(200).json({
            success: true,
            message: "Project retrieved successfully",
            data: { project }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ─── GET PRIVATE PROJECT INFO (Client or hired freelancer only) ───
// Note: isProjectParticipant middleware attaches req.project, so no need to query again
export const getPrivateProject = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Private project details retrieved successfully",
            data: { project: req.project }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
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
            page = 1,
            limit = 10
        } = req.query;

        const filter = { status: 'open' };

        // Filter by required skills (any match)
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
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
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [projects, total] = await Promise.all([
            Project.find(filter)
                .select('-privateDetails')
                .populate('client', 'firstName lastName companyName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Project.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        return res.status(200).json({
            success: true,
            message: "Projects listed successfully",
            data: {
                projects,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ─── HIRE A FREELANCER (Client only) ───
export const hireFreelancer = async (req, res) => {
    try {
        const { freelancerId } = req.body;
        const project = req.project; // attached by isProjectParticipant

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the client can hire", data: null });
        }

        if (project.status !== 'open') {
            return res.status(400).json({ success: false, message: "Project is not open for hiring", data: null });
        }

        project.hiredFreelancer = freelancerId;
        project.status = 'in-progress';
        await project.save();

        return res.status(200).json({
            success: true,
            message: "Freelancer hired successfully",
            data: { project }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ─── EDIT PROJECT (Client owner only, status must be 'open') ───
// 3.1 - PUT /api/projects/:id
export const editProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found", data: null });
        }

        // Only the client who created the project can edit it
        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied: Only the project owner can edit it", data: null });
        }

        // Can only edit open projects
        if (project.status !== 'open') {
            return res.status(400).json({ success: false, message: "Only open projects can be edited", data: null });
        }

        // Whitelist of editable fields
        const allowedFields = ['title', 'description', 'budgetMin', 'budgetMax', 'budgetType', 'skillsRequired', 'deadline'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                project[field] = req.body[field];
            }
        });

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: { project }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ─── CANCEL PROJECT (Client owner only, no accepted bids) ───
// 3.2 - DELETE /api/projects/:id
export const cancelProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found", data: null });
        }

        // Only the project's client can cancel it
        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied: Only the project owner can cancel it", data: null });
        }

        // Cannot cancel if already cancelled or completed
        if (project.status === 'cancelled') {
            return res.status(400).json({ success: false, message: "Project is already cancelled", data: null });
        }

        if (project.status === 'completed') {
            return res.status(400).json({ success: false, message: "Completed projects cannot be cancelled", data: null });
        }

        // Check for any accepted bids - cannot cancel if a bid has been accepted
        const acceptedBid = await Bid.findOne({ project: project._id, status: 'accepted' });
        if (acceptedBid) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a project with an accepted bid. Resolve the ongoing work first.",
                data: null
            });
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
            message: "Project cancelled successfully",
            data: { project }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};