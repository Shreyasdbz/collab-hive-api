import { Router } from 'express';
import {
    getProjectsSearchResults,
    getProjectDetails,
    createNewProject,
    toggleFavoriteProject,
    updateProjectDetails,
    deleteProject,
    createProjectLink,
    deleteProjectLink,
} from './project.controller';

const router = Router();

/**
 * method - GET
 * path - /api/v1/projects/{?sortBy,roles,technologies,complexities,page,limit}
 * Query Params:
 * - sortBy: string
 * - roles: string[]
 * - technologies: string[]
 * - complexities: string[]
 * - page: number
 * - limit: number
 */
router.get('/', getProjectsSearchResults);

/**
 * method - GET
 * path - /api/v1/projects/:projectId
 * Params:
 * - projectId: string
 */
router.get('/:projectId', getProjectDetails);

/**
 * method - POST
 * path - /api/v1/projects/
 * Body:
 * - name: string
 */
router.post('/', createNewProject);

/**
 * method - PATCH
 * path - /api/v1/projects/:projectId
 * Params:
 * - projectId: string
 */
router.patch('/:projectId', toggleFavoriteProject);

/**
 * method - PUT
 * path - /api/v1/projects/:projectId
 * Params:
 * - projectId: string
 * Body:
 * - description: string
 * - technologies: string[]
 * - complexity: string
 * - openToRoles: string[]
 * - isOpen: boolean
 */
router.put('/:projectId', updateProjectDetails);

/**
 * method - DELETE
 * path - /api/v1/projects/:projectId
 * Params:
 * - projectId: string
 */
router.delete('/:projectId', deleteProject);

/**
 * method - POST
 * path - /api/v1/projects/:projectId/links
 * Params:
 * - projectId: string
 * Body:
 * - linkType: string
 * - linkTitle: string
 * - linkUrl: string
 */
router.post('/:projectId/links', createProjectLink);

/**
 * method - DELETE
 * path - /api/v1/projects/:projectId/links/:linkId
 * Params:
 * - projectId: string
 * - linkId: string
 */
router.delete('/:projectId/links/:linkId', deleteProjectLink);

export default router;
