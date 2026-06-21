import Project from '../models/Project.js';

export const isProjectParticipant = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
                data: null
            });
        }

        const userId = req.user._id.toString();
        const isClient = project.client.toString() === userId;
        const isHiredFreelancer = project.hiredFreelancer?.toString() === userId;

        // Client always passes. Freelancer only passes if hired.
        if (!isClient && !isHiredFreelancer) {
            return res.status(403).json({
                success: false,
                message: "Access denied: You are not a participant of this project",
                data: null
            });
        }

        // Attach project to request so the controller doesn't need to fetch it again
        req.project = project;
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};