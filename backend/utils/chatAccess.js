import mongoose from 'mongoose';
import Project from '../models/Project.js';

/**
 * Single source of truth for "can this user use this project's chat?"
 * Returns { ok: false, status, message } or { ok: true, project, canSend }.
 */
export const getChatAccess = async (projectId, userId) => {
  if (!mongoose.isValidObjectId(projectId)) {
    return { ok: false, status: 400, message: 'Invalid project id' };
  }

  const project = await Project.findById(projectId).select(
    'client hiredFreelancer status title'
  );
  if (!project) {
    return { ok: false, status: 404, message: 'Project not found' };
  }

  const uid = userId.toString();
  const isClient = project.client.toString() === uid;
  const isHiredFreelancer = project.hiredFreelancer?.toString() === uid;

  if (!isClient && !isHiredFreelancer) {
    return {
      ok: false,
      status: 403,
      message: 'Access denied: You are not a participant of this project',
    };
  }

  // The client always passes the check above, so this is what enforces
  // "chat only opens after a freelancer is chosen".
  if (!project.hiredFreelancer) {
    return {
      ok: false,
      status: 403,
      message: 'Chat opens after a freelancer has been hired',
    };
  }

  return {
    ok: true,
    project,
    // History stays readable after completion/cancel, sending only while active
    canSend: project.status === 'in-progress',
  };
};
