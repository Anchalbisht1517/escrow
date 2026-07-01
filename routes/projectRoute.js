import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { isProjectParticipant } from '../middleware/isProjectParticipant.js';
import {
    createProject,
    getPublicProject,
    getPrivateProject,
    listProjects,
    editProject,
    cancelProject,
    completeProject
} from '../controller/projectController.js';

const router = express.Router();

// PUBLIC: List all open projects with pagination & filtering (any authenticated user)
// Query params: ?skills=react,node&budgetMin=500&budgetMax=5000&search=ecommerce&page=1&limit=10
router.get('/', protect, listProjects);

// PUBLIC: Get project public info (any authenticated user)
router.get('/:id/public', protect, getPublicProject);

// PRIVATE: Get full project with privateDetails (client or hired freelancer)
router.get('/:id/private', protect, restrictTo('client', 'freelancer'), isProjectParticipant, getPrivateProject);

// CREATE: Only clients can post projects
router.post('/', protect, restrictTo('client'), createProject);

// EDIT: Only the owning client can edit an open project
router.put('/:id', protect, restrictTo('client'), editProject);

// CANCEL: Client cancels a project (auto-refunds escrow if locked)
router.delete('/:id', protect, restrictTo('client'), isProjectParticipant, cancelProject);

// COMPLETE: Client marks project as done — releases escrow to freelancer
router.patch('/:id/complete', protect, restrictTo('client'), isProjectParticipant, completeProject);

// HIRE: Only client can hire a freelancer for their project
// Note: Use PATCH /bids/:id/accept instead — it locks escrow atomically

export default router;