import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { isProjectParticipant } from '../middleware/isProjectParticipant.js';
import {
    createProject,
    getPublicProject,
    getPrivateProject,
    listProjects,
    hireFreelancer
} from '../controller/projectController.js';

const router = express.Router();

// PUBLIC: List all open projects (any authenticated user)
router.get('/', protect, listProjects);

// PUBLIC: Get project public info (any authenticated user)
router.get('/:id/public', protect, getPublicProject);

// PRIVATE: Get full project with privateDetails (client or hired freelancer)
router.get('/:id/private', protect, restrictTo('client', 'freelancer'), isProjectParticipant, getPrivateProject);

// CREATE: Only clients can post projects
router.post('/', protect, restrictTo('client'), createProject);

// HIRE: Only client can hire a freelancer for their project
router.patch('/:id/hire', protect, restrictTo('client'), isProjectParticipant, hireFreelancer);

export default router;