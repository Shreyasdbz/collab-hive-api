import { Router } from 'express';
import {
    getCreatorProjectsCollaborationRequestsForUser,
    getCreatorProjectCards,
    getCollaboratorProjectCards,
    createCollaborationRequest,
    manageCollaborations,
    removeCollaboration,
} from './collaboration.controller';

const router = Router();

router.get('/', (_, res) => {
    res.json({
        message: 'Welcome to the CollabHive API - V1 - profile',
    });
});

/**
 * method - GET
 * path - /api/v1/collaboration/creator-requests
 * description - Get all collaboration requests for a user
 */
router.get('/creator-requests', getCreatorProjectsCollaborationRequestsForUser);

/**
 * method - GET
 * path - /api/v1/collaboration/creator-projects
 * description - Get all project cards created by a user
 */
router.get('/creator-projects', getCreatorProjectCards);

/**
 * method - GET
 * path - /api/v1/collaboration/collaborator-projects
 * description - Get all project a user is collaborating on
 */
router.get('/collaborator-projects', getCollaboratorProjectCards);

/**
 * method - POST
 * path - /api/v1/collaboration/:projectId
 * description - Create a new collaboration request
 */
router.post('/:projectId', createCollaborationRequest);

/**
 * method - PUT
 * path - /api/v1/collaboration/:projectId
 * description - Manages collaboration requests
 */
router.put('/:projectId', manageCollaborations);

/**
 * method - DELETE
 * path - /api/v1/collaboration/:projectId
 * description - Remove a collaboration
 */
router.delete('/:projectId', removeCollaboration);

export default router;
