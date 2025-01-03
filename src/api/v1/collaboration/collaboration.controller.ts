import { Request, Response } from 'express';
import { ServiceResponseType } from '@models/Response';
import { supabase } from '@config/supabase.config';
import logger from '@utils/logging.util';
import CollaborationService from './collaboration.service';
import { ManageCollaborationRequestDto } from './collaboration.dtos';

/**
 * [GET] /api/v1/collaboration/requests
 * Get all collaboration requests for a user
 * @param req
 * @param res
 * @returns
 * - Success: { GetCreatorProjectCollaborationRequestsResponseDto[] }
 * - Error: 401, 500
 */
export async function getCreatorProjectsCollaborationRequestsForUser(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info(
        '[v1 :: collaboration.controller :: getCollaborationRequestsForUser()] Init',
    );

    try {
        // Validate authorization
        const authHeader = req.headers.authorization;
        const { data } = await supabase.auth.getUser(authHeader as string);
        const userId = data?.user?.id;
        if (!userId) {
            logger.error(
                '[v1 :: collaboration.controller :: getCollaborationRequestsForUser()] Unauthorized',
            );
            res.status(401).send({ message: 'Unauthorized' });
            return;
        }

        const collaborationService = new CollaborationService();
        const result =
            await collaborationService.getCreatorProjectRequestsForUser(userId);

        switch (result.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: collaboration.controller :: getCollaborationRequestsForUser()] Success',
                );
                res.status(200).json(result.data);
                break;
            default:
                logger.error(
                    '[v1 :: collaboration.controller :: getCollaborationRequestsForUser()] Error',
                );
                res.status(500).json({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            '[v1 :: collaboration.controller :: getCollaborationRequestsForUser()] Error',
            error,
        );
        res.status(500).json({ message: 'Something went wrong :(' });
    }
}

/**
 * [GET] /api/v1/collaboration/:userId/creator-project-cards
 * Get all projects created by a user
 * @param req
 * @param res
 * - Success: 200
 * - Error: 401, 404, 500
 * @returns
 * - Success: { ProjectCard[] }
 * - Error: { message: 'No projects found' | 'Something went wrong' }
 */
export async function getCreatorProjectCards(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info(
        '[v1 :: collaboration.controller :: getCreatorProjectCards()] Init',
    );

    // Validate authorization
    const authHeader = req.headers.authorization;
    const { data } = await supabase.auth.getUser(authHeader as string);
    const userId = data?.user?.id;
    if (!userId) {
        logger.error(
            '[v1 :: collaboration.controller :: getCreatorProjectCards()] Unauthorized',
        );
        res.status(401).send({ message: 'Unauthorized' });
        return;
    }

    try {
        const collaborationService = new CollaborationService();

        const creatorProjectCardsResult =
            await collaborationService.getCreatorProjectCards(userId);

        switch (creatorProjectCardsResult.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: collaboration.controller :: getCreatorProjectCards()] Success',
                );
                res.status(200).json(creatorProjectCardsResult.data);
                break;
            case ServiceResponseType.NOT_FOUND:
                logger.error(
                    '[v1 :: collaboration.controller :: getCreatorProjectCards()] Error',
                );
                res.status(404).json({ message: 'No projects found' });
                break;
            default:
                logger.error(
                    '[v1 :: collaboration.controller :: getCreatorProjectCards()] Error',
                );
                res.status(500).json({ message: 'Something went wrong' });
                break;
        }
    } catch (err) {
        logger.error(
            '[v1 :: profile.controller :: getCreatorProjectCards()] Error',
            err,
        );
        res.status(500).json({ message: 'Something went wrong :(' });
    }
}

/**
 * [GET] /api/v1/collaboration/:userId/collaborator-project-cards
 * Get all project cards a user is collaborating on
 * @param req
 * @param res
 * - Success: 200
 * - Error: 401, 404, 500
 * @returns
 * - Success: { ProjectCard[] }
 * - Error: { message: 'No projects found' | 'Something went wrong' }
 */
export async function getCollaboratorProjectCards(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info(
        '[v1 :: collaboration.controller :: getCollaboratorProjectCards()] Init',
    );

    // Validate authorization
    const authHeader = req.headers.authorization;
    const { data } = await supabase.auth.getUser(authHeader as string);
    const userId = data?.user?.id;
    if (!userId) {
        logger.error(
            '[v1 :: collaboration.controller :: getCollaboratorProjectCards()] Unauthorized',
        );
        res.status(401).send({ message: 'Unauthorized' });
        return;
    }

    try {
        const collaborationService = new CollaborationService();

        const collaboratorProjectCardsResult =
            await collaborationService.getCollaboratorProjectCards(userId);

        switch (collaboratorProjectCardsResult.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: collaboration.controller :: getCollaboratorProjectCards()] Success',
                );
                res.status(200).json(collaboratorProjectCardsResult.data);
                break;
            case ServiceResponseType.NOT_FOUND:
                logger.error(
                    '[v1 :: collaboration.controller :: getCollaboratorProjectCards()] Error',
                );
                res.status(404).json({ message: 'No projects found' });
                break;
            default:
                logger.error(
                    '[v1 :: collaboration.controller :: getCollaboratorProjectCards()] Error',
                );
                res.status(500).json({ message: 'Something went wrong' });
                break;
        }
    } catch (error) {
        logger.error(
            '[v1 :: collaboration.controller :: getCollaboratorProjectCards()] Error',
            error,
        );
        res.status(500).json({ message: 'Something went wrong' });
    }
}

/**
 * [POST] /api/v1/collaboration/:projectId
 * Creates a new collaboration request
 * @param req
 * - params: projectId (string)
 * - body: requestMessage (string)
 * @param res
 * - Success: 201
 * - Error: 400, 401, 500
 * @returns
 * - Success: { message: 'Join request sent!' }
 * - Error: { message: 'Invalid project ID' | 'Request message is required' | 'Something went wrong :(' }
 */
export async function createCollaborationRequest(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info(
        `[v1 :: collaboration.controller :: createCollaborationRequest()] Init for project ${req.params.projectId}`,
    );

    try {
        // Validate projectId param
        const projectId = req.params.projectId;
        if (!projectId) {
            res.status(400).json({ message: 'Invalid project ID' });
            return;
        }
        // Validate requestMessage body
        const { requestMessage } = req.body;
        if (!requestMessage) {
            res.status(400).json({ message: 'Request message is required' });
            return;
        }
        // Validate authorization
        const authHeader = req.headers.authorization;
        const { data } = await supabase.auth.getUser(authHeader as string);
        const userId = data?.user?.id;
        if (!userId) {
            logger.error(
                '[v1 :: collaboration.controller :: createCollaborationRequest()] Unauthorized',
            );
            res.status(401).send({ message: 'Unauthorized' });
            return;
        }

        const collaborationService = new CollaborationService();
        const result = await collaborationService.requestToJoin(
            projectId,
            userId,
            requestMessage,
        );
        switch (result.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: collaboration.controller :: createCollaborationRequest()] Success',
                );
                res.status(201).json({ message: 'Join request sent!' });
                break;
            case ServiceResponseType.BAD_REQUEST:
                logger.error(
                    '[v1 :: collaboration.controller :: createCollaborationRequest()] Bad request',
                );
                res.status(400).json({ message: result.message });
                break;
            default:
                logger.error(
                    '[v1 :: collaboration.controller :: createCollaborationRequest()] Error',
                );
                res.status(500).json({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            '[v1 :: collaboration.controller :: createCollaborationRequest()] Error',
            error,
        );
        res.status(500).json({ message: 'Something went wrong :(' });
    }
}

/**
 * [PUT] /api/v1/collaboration/:projectId
 * Manage collaborations
 * @param req
 * - params: projectId (string)
 * - body: { ManageCollaborationRequestDto }
 * @param res
 * - Success: 200
 * - Error: 400, 401, 500
 * @returns
 * - Success: { message: 'Collaborations managed!' }
 * - Error: { message: 'Invalid project ID' | 'Invalid request body' | 'Something went wrong :(' }
 */
export async function manageCollaborations(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        // Validate projectId param
        const projectId = req.params.projectId;
        if (!projectId) {
            res.status(400).json({ message: 'Invalid project ID' });
            return;
        }
        // Validate body
        const { requestsAccepted, requestsDeclined, collaboratorsRemoved } =
            req.body as ManageCollaborationRequestDto;
        if (
            requestsAccepted === null ||
            requestsDeclined === null ||
            collaboratorsRemoved === null
        ) {
            res.status(400).json({ message: 'Invalid request body' });
            return;
        }

        // Validate authorization
        const authHeader = req.headers.authorization;
        const { data } = await supabase.auth.getUser(authHeader as string);
        const userId = data?.user?.id;
        if (!userId) {
            logger.error(
                '[v1 :: collaboration.controller :: getCreatorProjectCards()] Unauthorized',
            );
            res.status(401).send({ message: 'Unauthorized' });
            return;
        }

        const collaborationService = new CollaborationService();
        const result = await collaborationService.manage(
            projectId,
            requestsAccepted,
            requestsDeclined,
            collaboratorsRemoved,
        );

        switch (result.type) {
            case ServiceResponseType.SUCCESS:
                res.status(200).json({ message: 'Collaborations managed!' });
                break;
            case ServiceResponseType.BAD_REQUEST:
                res.status(400).json({ message: result.message });
                break;
            default:
                res.status(500).json({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            '[v1 :: collaboration.controller :: manageCollaborations()] Error',
            error,
        );
        res.status(500).json({ message: 'Something went wrong :(' });
    }
}

/**
 * [DELETE] /api/v1/collaboration/:projectId
 * Remove a collaboration (user leaves project)
 * @param req
 * - params: projectId (string)
 * @param res
 * - Success: 204
 * - Error: 400, 401, 500
 * @returns
 * - Success: { message: 'Collaboration removed!' }
 * - Error: { message: 'Invalid project ID' | 'Something went wrong :(' }
 */
export async function removeCollaboration(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        // Validate projectId param
        const projectId = req.params.projectId;
        if (!projectId) {
            res.status(400).json({ message: 'Invalid project ID' });
            return;
        }

        // Validate authorization
        const authHeader = req.headers.authorization;
        const { data } = await supabase.auth.getUser(authHeader as string);
        const userId = data?.user?.id;
        if (!userId) {
            logger.error(
                '[v1 :: collaboration.controller :: removeCollaboration()] Unauthorized',
            );
            res.status(401).send({ message: 'Unauthorized' });
            return;
        }

        const collaborationService = new CollaborationService();
        const result = await collaborationService.leave(projectId, userId);

        switch (result.type) {
            case ServiceResponseType.SUCCESS:
                res.status(204).json({ message: 'Collaboration removed!' });
                break;
            case ServiceResponseType.BAD_REQUEST:
                res.status(400).json({ message: result.message });
                break;
            default:
                res.status(500).json({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            '[v1 :: collaboration.controller :: removeCollaboration()] Error',
            error,
        );
        res.status(500).json({ message: 'Something went wrong :(' });
    }
}
