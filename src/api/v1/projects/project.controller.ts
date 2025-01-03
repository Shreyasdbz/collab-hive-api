import { Request, Response, NextFunction } from 'express';
import { ServiceResponseType } from '@models/Response';
import { supabase } from '@config/supabase.config';
import logger from '@utils/logging.util';
import ProjectService from './project.service';
import CollaborationService from '../collaboration/collaboration.service';
import { UpdateProjectDetailsRequestDto } from './project.dtos';

/**
 * [GET] /api/v1/projects?sortBy=string&roles=string[]&technologies=string[]&complexities=string[]&technologies=string[]&page=number&limit=number
 * Get search results for projects
 * @param req query { sortBy: string, roles: string[], technologies: string[], complexities: string[], technologies: string[], page: number, limit: number }
 * @param res response { GetProjectSearchResultsResponseDto[] }
 * @returns
 * - Success: 200 { GetProjectSearchResultsResponseDto[] }
 * - Not Found: 404 { message: string }
 * - Error: 500 { message: string }
 */
export async function getProjectsSearchResults(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info(
        '[v1 :: project.controller :: getProjectsSearchResults()] Init',
    );

    const { sortBy, roles, complexities, technologies, page, limit } =
        req.query;
    logger.info(
        `[v1 :: project.controller :: getProjectsSearchResults()]
        Filters:
        sortBy: ${sortBy}, 
        roles: ${roles}, 
        technologies: ${technologies}, 
        complexities: ${complexities},
        page: ${page},
        limit: ${limit}`,
    );

    try {
        const projectService = new ProjectService();
        const searchResults = await projectService.find({
            roles: roles as string[],
            complexities: complexities as string[],
            technologies: technologies as string[],
            sortBy: sortBy as string,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
        });

        switch (searchResults.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: project.controller :: getProjectsSearchResults()] Success',
                );
                res.status(200).send(searchResults.data);
                break;
            case ServiceResponseType.NOT_FOUND:
                logger.info(
                    '[v1 :: project.controller :: getProjectsSearchResults()] No results found',
                );
                res.status(404).send({ message: 'No results found' });
                break;
            default:
                logger.error(
                    `[v1 :: project.controller :: getProjectsSearchResults()] Default case`,
                );
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            `[v1 :: project.controller :: getProjectsSearchResults()] Error: ${error}`,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}

/**
 * [GET] /api/v1/projects/:projectId
 * Get full details of a project
 * @param req params { projectId: string }
 * @param res
 * @returns
 * - Success: 200 { GetProjectDetailsResponseDto }
 * - Not Found: 404 { message: string }
 * - Error: 500 { message: string }
 */
export async function getProjectDetails(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: project.controller :: getProjectDetails()] Init');

    const { projectId } = req.params;
    logger.info(
        `[v1 :: project.controller :: getProjectDetails()] Project ID: ${projectId}`,
    );
    if (!projectId) {
        res.status(400).send({ message: 'No projectId in URL' });
        return;
    }

    // Grab authorization header from request
    const authHeader = req.headers.authorization;
    const { data } = await supabase.auth.getUser(authHeader as string);
    logger.info(
        `[v1 :: project.controller :: getProjectDetails()] User ID: ${data?.user?.id}]`,
    );

    try {
        const projectService = new ProjectService();
        const projectDetails = await projectService.getDetails({
            projectId,
            userId: data?.user?.id,
        });

        switch (projectDetails.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: project.controller :: getProjectDetails()] Success',
                );
                res.status(200).send(projectDetails.data);
                break;
            default:
                logger.error(
                    `[v1 :: project.controller :: getProjectDetails()] Default case`,
                );
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            `[v1 :: project.controller :: getProjectDetails()] Error: ${error}`,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}

/**
 * [POST] /api/v1/projects/
 * Creates a new project
 * @param req body { name: string }
 * @param res response { project url }
 * @returns
 * - Success: 201 { projectId: string }
 * - Unauthorized: 401 { message: string }
 * - Error: 500 { message: string }
 */
export async function createNewProject(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: project.controller :: createNewProject()] Init');

    // Parse and validate body
    const { name } = req.body;
    if (!name) {
        logger.warn(
            '[v1 :: project.controller :: createNewProject()] No project name provided',
        );
        res.status(400).send({ message: 'No project name provided' });
        return;
    }

    // Validate authorization
    const authHeader = req.headers.authorization;
    const { data } = await supabase.auth.getUser(authHeader as string);
    const userId = data?.user?.id;
    if (!userId) {
        logger.error(
            '[v1 :: project.controller :: createNewProject()] Unauthorized',
        );
        res.status(401).send({ message: 'Unauthorized' });
        return;
    }

    logger.info(
        `[v1 :: project.controller :: createNewProject()] Project name: ${name}`,
    );

    try {
        const projectService = new ProjectService();
        const projectIdResult = await projectService.createNew({
            userId,
            newProjectName: name,
        });

        switch (projectIdResult.type) {
            case ServiceResponseType.SUCCESS:
                res.status(201).send({ projectId: projectIdResult.data });
                break;
            default:
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            `[v1 :: project.controller :: createNewProject()] Error: ${error}`,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}

/**
 * [PATCH] /api/v1/projects/:projectId
 * Toggles the favorite status of a project by the user
 * @param req params { projectId: string }
 * @param res
 * @returns
 * - Success: 200 { message: string }
 * - Unauthorized: 401 { message: string }
 * - Forbidden: 403 { message: string }
 * - Error: 500 { message: string }
 */
export async function toggleFavoriteProject(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: project.controller :: toggleFavoriteProject()] Init');

    // Grab project ID from request params and validate
    const { projectId } = req.params;
    if (!projectId) {
        res.status(400).send({ message: 'No project ID in URL' });
        return;
    }
    logger.info(
        `[v1 :: project.controller :: toggleFavoriteProject()] Project ID: ${projectId}`,
    );

    // Grab authorization header from request and validate
    const authHeader = req.headers.authorization;
    const { data } = await supabase.auth.getUser(authHeader as string);
    const userId = data?.user?.id;
    if (!userId) {
        logger.error(
            '[v1 :: project.controller :: toggleFavoriteProject()] Unauthorized',
        );
        res.status(401).send({ message: 'Unauthorized' });
        return;
    }

    try {
        const projectService = new ProjectService();

        // Perform toggle
        const toggleResult = await projectService.toggleFavorite({
            projectId,
            userId,
        });
        switch (toggleResult.type) {
            case ServiceResponseType.SUCCESS:
                res.status(200).send({ message: 'Success' });
                break;
            case ServiceResponseType.NOT_FOUND:
                res.status(404).send({ message: toggleResult.message });
                break;
            case ServiceResponseType.FORBIDDEN:
                res.status(403).send({ message: toggleResult.message });
                break;
            default:
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            `[v1 :: project.controller :: toggleFavoriteProject()] Error: ${error}`,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}

/**
 * [PUT] /api/v1/projects/:projectId
 * Update project details
 * @param req
 * - params { projectId: string }
 * - body { UpdateProjectDetailsRequestDto }
 * @param res
 * @returns
 * - Success: 200 { message: string }
 * - Forbidden: 403 { message: string }
 * - Error: 500 { message: string }
 */
export async function updateProjectDetails(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: project.controller :: updateProjectDetails()] Init');

    const { projectId } = req.params;
    const { name, description, roles, technologies, complexity, isOpen } =
        req.body as UpdateProjectDetailsRequestDto;

    logger.info(
        `[v1 :: project.controller :: updateProjectDetails()] Project ID: ${projectId}`,
    );
    try {
        // Verify permissions
        const collaborationService = new CollaborationService();
        const projectService = new ProjectService();

        const userHasPermission =
            await collaborationService.validateUserPermissionForProjectEdit({
                userId: req.body.userId,
                projectId,
            });
        if (!userHasPermission) {
            res.status(403).send({ message: 'Forbidden' });
        }

        // Perform update
        const updateResult = await projectService.updateDetails({
            projectId,
            name,
            description,
            roles,
            technologies,
            complexity,
            isOpen,
        });
        switch (updateResult.type) {
            case ServiceResponseType.SUCCESS:
                res.status(200).send({ message: 'Success' });
                break;
            default:
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            `[v1 :: project.controller :: updateProjectDetails()] Error: ${error}`,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}

/**
 * [DELETE] /api/v1/projects/:projectId
 * Deletes a project
 * @param req params { projectId: string }
 * @param res
 * @returns
 * - Success: 204 { message: string }
 * - Forbidden: 403 { message: string }
 * - Error: 500 { message: string }
 */
export async function deleteProject(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: project.controller :: deleteProject()] Init');

    // Grab project ID from request params and validate
    const { projectId } = req.params;
    if (!projectId) {
        res.status(400).send({ message: 'No project ID in URL' });
        return;
    }
    logger.info(
        `[v1 :: project.controller :: deleteProject()] Project ID: ${projectId}`,
    );

    // Grab authorization header from request and validate
    const authHeader = req.headers.authorization;
    const { data } = await supabase.auth.getUser(authHeader as string);
    const userId = data?.user?.id;
    if (!userId) {
        res.status(401).send({ message: 'Unauthorized' });
        return;
    }

    try {
        const projectService = new ProjectService();
        const collaborationService = new CollaborationService();

        // Verify permissions
        const userHasPermission =
            await collaborationService.validateUserPermissionForProjectEdit({
                userId: userId,
                projectId,
            });
        if (!userHasPermission) {
            res.status(403).send({ message: 'Forbidden' });
            return;
        }

        // Perform delete
        const deleteResult = await projectService.delete({
            projectId,
        });
        switch (deleteResult.type) {
            case ServiceResponseType.SUCCESS:
                res.status(204).send({ message: 'Success' });
                break;
            default:
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            `[v1 :: project.controller :: deleteProject()] Error: ${error}`,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}
