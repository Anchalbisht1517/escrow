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
  completeProject,
  submitWork,
  requestRevision,
} from '../controller/projectController.js';

const router = express.Router();

// PUBLIC: List all open projects with pagination & filtering (guests and logged in users)
// Query params: ?skills=react,node&budgetMin=500&budgetMax=5000&search=ecommerce&page=1&limit=10
router.get('/', listProjects);

// PUBLIC: Get project public info
router.get('/:id/public', getPublicProject);

// PRIVATE: Get full project with privateDetails (client or hired freelancer)
router.get(
  '/:id/private',
  protect,
  restrictTo('client', 'freelancer'),
  isProjectParticipant,
  getPrivateProject
);

// CREATE: Only clients can post projects
router.post('/', protect, restrictTo('client'), createProject);

// EDIT: Only the owning client can edit an open project
router.put('/:id', protect, restrictTo('client'), editProject);

// CANCEL: Client cancels a project (auto-refunds escrow if locked)
router.delete(
  '/:id',
  protect,
  restrictTo('client'),
  isProjectParticipant,
  cancelProject
);

// COMPLETE: Client marks project as done — releases escrow to freelancer
router.patch(
  '/:id/complete',
  protect,
  restrictTo('client'),
  isProjectParticipant,
  completeProject
);

// HIRE: Only client can hire a freelancer for their project
// Note: Use PATCH /bids/:id/accept instead — it locks escrow atomically

// SUBMIT WORK: Hired freelancer marks work as done for review
router.patch(
  '/:id/submit',
  protect,
  restrictTo('freelancer'),
  isProjectParticipant,
  submitWork
);

// REQUEST REVISION: Client sends project back from under-review → in-progress
router.patch(
  '/:id/revision',
  protect,
  restrictTo('client'),
  isProjectParticipant,
  requestRevision
);

export default router;
