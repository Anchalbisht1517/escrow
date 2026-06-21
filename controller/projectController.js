import Project from '../models/Project.js';

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

// ─── LIST ALL OPEN PROJECTS (Public browsing) ───
export const listProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: 'open' })
            .select('-privateDetails')
            .populate('client', 'firstName lastName companyName');

        return res.status(200).json({
            success: true,
            message: "Projects listed successfully",
            data: { projects }
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