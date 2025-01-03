import { CollaborationRelationship } from '@prisma/client';
import { ServiceResponse, ServiceResponseType } from '@models/Response';
import { ProjectTechnologiesMapping } from '@models/project-mappings';
import { prisma } from '@config/database.config';
import {
    GetCreatorProjectCardResponseDto,
    GetCollaboratorProjectCardResponseDto,
    GetCreatorProjectCollaborationRequestsResponseDto,
} from './collaboration.dtos';
import logger from '@utils/logging.util';

/**
 * Collaboration Service - handles all "collaboration" table related operations
 * @class CollaborationService
 */
export default class CollaborationService {
    /**
     *
     * @param technologies: string[] of keys
     * @returns Compact text in sentence form
     */
    private getTechnologyStackText(technologies: string[]): string {
        if (technologies.length === 0) {
            return '';
        }
        // Find the technology names from the keys
        const technologyNamesList = technologies.map((technology) => {
            const getValue = ProjectTechnologiesMapping.get(technology);
            if (getValue === undefined) {
                return '';
            }
            return getValue;
        });
        // If 1 technology, return it
        // If 2 technologies, return "Tech1 and Tech2"
        // If 3 technologies, return "Tech1, Tech2, and Tech3"
        // If more than 3 technologies, return "Tech1, Tech2, Tech3, and x more"
        switch (technologyNamesList.length) {
            case 1:
                return technologyNamesList[0];
            case 2:
                return `${technologyNamesList[0]} and ${technologyNamesList[1]}`;
            case 3:
                return `${technologyNamesList[0]}, ${technologyNamesList[1]}, and ${technologyNamesList[2]}`;
            default:
                return `${technologyNamesList[0]}, ${technologyNamesList[1]}, ${
                    technologyNamesList[2]
                }, and ${technologyNamesList.length - 3} more`;
        }
    }
    private getCollaboratorsText(collaborators: string[]): string {
        if (collaborators.length === 0) {
            return '';
        }
        // If 1 collaborator, return "Collaborator1"
        // If 2 collaborators, return "Collaborator1 and Collaborator2"
        // If 3 collaborators, return "Collaborator1, Collaborator2, and Collaborator3"
        // If more than 3 collaborators, return "Collaborator1, Collaborator2, Collaborator3, and x more"
        const collaboratorCount = collaborators.length;

        switch (collaboratorCount) {
            case 1:
                return collaborators[0];
            case 2:
                return `${collaborators[0]} and ${collaborators[1]}`;
            case 3:
                return `${collaborators[0]}, ${collaborators[1]}, and ${collaborators[2]}`;
            default:
                return `${collaborators[0]}, ${collaborators[1]}, ${
                    collaborators[2]
                }, and ${collaborators.length - 3} more`;
        }
    }

    /**
     * Gets all collaboration requests for a user where the user is the creator
     * @param userId
     * @returns {Promise<ServiceResponse<GetCreatorProjectCollaborationRequestsResponseDto[]>>}
     */
    public async getCreatorProjectRequestsForUser(
        userId: string,
    ): Promise<
        ServiceResponse<GetCreatorProjectCollaborationRequestsResponseDto[]>
    > {
        logger.info(
            `[v1 :: collaboration.service :: getCreatorProjectRequestsForUser()] Init with userId: ${userId}]`,
        );

        try {
            const collaborationsResult = await prisma.collaboration.findMany({
                where: {
                    profile_id: userId,
                    relation: CollaborationRelationship.Creator,
                },
                include: {
                    Project: {
                        select: {
                            id: true,
                            name: true,
                            Collaborations: {
                                where: {
                                    relation:
                                        CollaborationRelationship.CollaboratorPending,
                                },
                                select: {
                                    profile_id: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!collaborationsResult) {
                logger.error(
                    '[v1 :: collaboration.service :: getCreatorProjectRequestsForUser()] Error',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Could not fetch collaborations',
                };
            }

            // Map the results to DTO
            const collaborationRequests: GetCreatorProjectCollaborationRequestsResponseDto[] =
                collaborationsResult.map((result) => {
                    return {
                        projectId: result.Project.id,
                        projectName: result.Project.name,
                        numberOfRequests: result.Project.Collaborations.length,
                    };
                });
            logger.info(
                `[v1 :: collaboration.service :: getCreatorProjectRequestsForUser()] Success :: ${collaborationRequests.length} collaboration requests found`,
            );
            return {
                type: ServiceResponseType.SUCCESS,
                data: collaborationRequests,
            };
        } catch (error) {
            logger.error(
                '[v1 :: collaboration.service :: getCreatorProjectRequestsForUser()] Error',
                error,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }

        return {
            type: ServiceResponseType.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
        };
    }

    /**
     * Validate user permission to edit project
     * @param projectId
     * @param userId
     * @returns boolean (true if user has permission)
     */
    public async validateUserPermissionForProjectEdit({
        projectId,
        userId,
    }: {
        projectId: string;
        userId: string;
    }): Promise<boolean | null> {
        logger.info(
            '[v1 :: collaboration.service :: validateUserPermissionForProjectEdit()] Init',
        );

        try {
            const collaborationResult = await prisma.collaboration.findFirst({
                where: {
                    project_id: projectId,
                    profile_id: userId,
                    relation: CollaborationRelationship.Creator,
                },
            });
            if (!collaborationResult) {
                // User is not the creator
                return false;
            }
            // User is the creator
            return true;
        } catch (error) {
            logger.error(
                '[v1 :: collaboration.service :: validateUserPermissionForProjectEdit()] Error',
                error,
            );
            return null;
        }
    }

    /**
     * Returns a list of project cards where the user is the creator
     * @param userId
     * @returns {Promise<ServiceResponse<GetCreatorProjectCardResponseDto[]>> }
     */
    public async getCreatorProjectCards(
        userId: string,
    ): Promise<ServiceResponse<GetCreatorProjectCardResponseDto[]>> {
        logger.info(
            `[v1 :: collaboration.service :: getCreatorProjectCards()] Init with userId: ${userId}]`,
        );

        try {
            const creatorProjectResults = await prisma.collaboration.findMany({
                where: {
                    profile_id: userId,
                    relation: CollaborationRelationship.Creator,
                },
                include: {
                    Project: {
                        select: {
                            id: true,
                            name: true,
                            is_open: true,
                            technologies: true,
                            updated_at: true,
                            Collaborations: {
                                where: {
                                    relation:
                                        CollaborationRelationship.CollaboratorAccepted,
                                },
                                include: {
                                    Profile: {
                                        select: {
                                            id: true,
                                            name: true,
                                            avatar_url: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (creatorProjectResults === null) {
                logger.error(
                    '[v1 :: collaboration.service :: getCreatorProjectCards()] Error',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Could not fetch projects',
                };
            }

            if (creatorProjectResults.length === 0) {
                logger.info(
                    '[v1 :: collaboration.service :: getCreatorProjectCards()] No projects found',
                );
                return {
                    type: ServiceResponseType.NOT_FOUND,
                    message: 'No projects found',
                };
            }

            // Map the results to DTO
            const projectCards: GetCreatorProjectCardResponseDto[] =
                creatorProjectResults.map((result) => {
                    return {
                        id: result.Project.id,
                        name: result.Project.name,
                        technologyStackText: this.getTechnologyStackText(
                            result.Project.technologies,
                        ),
                        collaboratorsText: `${
                            result.Project.Collaborations.length > 0
                                ? 'With'
                                : ''
                        } ${this.getCollaboratorsText(
                            result.Project.Collaborations.map(
                                (collaboration) => {
                                    return collaboration.Profile.name;
                                },
                            ),
                        )}`,
                        isOpen: result.Project.is_open,
                    };
                });

            logger.info(
                `[v1 :: collaboration.service :: getCreatorProjectCards()] Success :: ${projectCards.length} projects found`,
            );
            return {
                type: ServiceResponseType.SUCCESS,
                data: projectCards,
            };
        } catch (error) {
            logger.error(
                '[v1 :: collaboration.service :: getCreatorProjectCards()] Error',
                error,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Returns a list of project cards where the user is a collaborator
     * @param userId
     * @returns {Promise<ServiceResponse<GetCollaboratorProjectCardResponseDto[]>> }
     */
    public async getCollaboratorProjectCards(
        userId: string,
    ): Promise<ServiceResponse<GetCollaboratorProjectCardResponseDto[]>> {
        logger.info(
            `[v1 :: collaboration.service :: getCollaboratorProjectCards()] Init with userId: ${userId}]`,
        );

        try {
            const collaboratorProjectResults =
                await prisma.collaboration.findMany({
                    where: {
                        profile_id: userId,
                        relation:
                            CollaborationRelationship.CollaboratorAccepted,
                    },
                    include: {
                        Project: {
                            select: {
                                id: true,
                                name: true,
                                is_open: true,
                                technologies: true,
                                updated_at: true,
                                Collaborations: {
                                    where: {
                                        OR: [
                                            {
                                                relation:
                                                    CollaborationRelationship.Creator,
                                            },
                                            {
                                                relation:
                                                    CollaborationRelationship.CollaboratorAccepted,
                                            },
                                        ],
                                    },
                                    include: {
                                        Profile: {
                                            select: {
                                                id: true,
                                                name: true,
                                                avatar_url: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

            if (collaboratorProjectResults === null) {
                logger.error(
                    '[v1 :: collaboration.service :: getCollaboratorProjectCards()] Error',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Could not fetch projects',
                };
            }
            if (collaboratorProjectResults.length === 0) {
                logger.info(
                    '[v1 :: collaboration.service :: getCollaboratorProjectCards()] No projects found',
                );
                return {
                    type: ServiceResponseType.NOT_FOUND,
                    message: 'No projects found',
                };
            }

            logger.info(
                `[v1 :: collaboration.service :: getCollaboratorProjectCards()] Success :: ${collaboratorProjectResults.length} projects found`,
            );

            // Map the results to DTO
            const projectCards: GetCollaboratorProjectCardResponseDto[] =
                collaboratorProjectResults.map((result) => {
                    return {
                        id: result.Project.id,
                        name: result.Project.name,
                        technologyStackText: this.getTechnologyStackText(
                            result.Project.technologies,
                        ),
                        creatorName:
                            result.Project.Collaborations.find(
                                (collaboration) => {
                                    return (
                                        collaboration.relation ===
                                        CollaborationRelationship.Creator
                                    );
                                },
                            )?.Profile.name || '',
                        collaboratorsText: this.getCollaboratorsText(
                            result.Project.Collaborations.map(
                                (collaboration) => {
                                    return collaboration.Profile.name;
                                },
                            ),
                        ),
                    };
                });

            return {
                type: ServiceResponseType.SUCCESS,
                data: projectCards,
            };
        } catch (error) {
            logger.error(
                '[v1 :: collaboration.service :: getCollaboratorProjectCards()] Error',
                error,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Creates a new collaboration request
     * @param projectId
     * @param userId
     * @param requestMessage
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async requestToJoin(
        projectId: string,
        userId: string,
        requestMessage: string,
    ): Promise<ServiceResponse<string>> {
        logger.info(
            `[v1 :: collaboration.service :: requestToJoin()] Init with projectId: ${projectId}], userId: ${userId}] and requestMessage: ${requestMessage}]`,
        );

        try {
            const existingCollaboration = await prisma.collaboration.findFirst({
                where: {
                    project_id: projectId,
                    profile_id: userId,
                },
            });

            if (existingCollaboration !== null) {
                switch (existingCollaboration.relation) {
                    case CollaborationRelationship.CollaboratorPending:
                        logger.info(
                            '[v1 :: collaboration.service :: requestToJoin()] User has already requested to join the project',
                        );
                        return {
                            type: ServiceResponseType.BAD_REQUEST,
                            message:
                                'You have already requested to join this project',
                        };
                    case CollaborationRelationship.CollaboratorDeclined:
                        logger.info(
                            '[v1 :: collaboration.service :: requestToJoin()] Creator has previously declined to join the project',
                        );
                        return {
                            type: ServiceResponseType.BAD_REQUEST,
                            message:
                                'The creator has previously declined your request to join this project',
                        };
                    case CollaborationRelationship.CollaboratorAccepted:
                        logger.info(
                            '[v1 :: collaboration.service :: requestToJoin()] User is already a collaborator on the project',
                        );
                        return {
                            type: ServiceResponseType.BAD_REQUEST,
                            message:
                                'You are already a collaborator on this project',
                        };
                    default:
                        logger.warn(
                            '[v1 :: collaboration.service :: requestToJoin()] Unknown relationship',
                        );
                        return {
                            type: ServiceResponseType.BAD_REQUEST,
                            message: 'Unknown relationship',
                        };
                }
            }

            const newCollaboration = await prisma.collaboration.create({
                data: {
                    project_id: projectId,
                    profile_id: userId,
                    relation: CollaborationRelationship.CollaboratorPending,
                    request_message: requestMessage,
                },
            });

            if (newCollaboration === null) {
                logger.error(
                    '[v1 :: collaboration.service :: requestToJoin()] Error',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                };
            }

            logger.info(
                '[v1 :: collaboration.service :: requestToJoin()] Success',
            );
            return {
                type: ServiceResponseType.SUCCESS,
                data: 'Request sent',
            };
        } catch (error) {
            logger.error(
                '[v1 :: collaboration.service :: requestToJoin()] Error',
                error,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Handles collaboration request
     * @param projectId (string)
     * @param requestsAccepted (string[])
     * @param requestsDeclined (string[])
     * @param collaboratorsRemoved (string[])
     */
    public async manage(
        projectId: string,
        requestsAccepted: string[],
        requestsDeclined: string[],
        collaboratorsRemoved: string[],
    ): Promise<ServiceResponse<null>> {
        logger.info(
            `[v1 :: collaboration.service :: manage()] Init with projectId: ${projectId}]`,
        );
        logger.info(
            `[v1 :: collaboration.service :: manage()] requestsAccepted: ${requestsAccepted}`,
        );
        logger.info(
            `[v1 :: collaboration.service :: manage()] requestsDeclined: ${requestsDeclined}`,
        );
        logger.info(
            `[v1 :: collaboration.service :: manage()] collaboratorsRemoved: ${collaboratorsRemoved}`,
        );

        try {
            // Update requestsAccepted
            if (requestsAccepted.length > 0) {
                const requestsAcceptedResult =
                    await prisma.collaboration.updateMany({
                        where: {
                            project_id: projectId,
                            profile_id: {
                                in: requestsAccepted,
                            },
                        },
                        data: {
                            relation:
                                CollaborationRelationship.CollaboratorAccepted,
                        },
                    });

                if (!requestsAcceptedResult) {
                    logger.error(
                        '[v1 :: collaboration.service :: manage()] Error',
                    );
                    return {
                        type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                        message:
                            'Internal server error with accepting requests',
                    };
                }
            }

            // Update requestsDeclined
            if (requestsDeclined.length > 0) {
                const requestsDeclinedResult =
                    await prisma.collaboration.updateMany({
                        where: {
                            project_id: projectId,
                            profile_id: {
                                in: requestsDeclined,
                            },
                        },
                        data: {
                            relation:
                                CollaborationRelationship.CollaboratorDeclined,
                        },
                    });

                if (!requestsDeclinedResult) {
                    logger.error(
                        '[v1 :: collaboration.service :: manage()] Error',
                    );
                    return {
                        type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                        message:
                            'Internal server error with declining requests',
                    };
                }
            }

            // Remove collaborators
            if (collaboratorsRemoved.length > 0) {
                const collaboratorsRemovedResult =
                    await prisma.collaboration.deleteMany({
                        where: {
                            project_id: projectId,
                            profile_id: {
                                in: collaboratorsRemoved,
                            },
                        },
                    });

                if (!collaboratorsRemovedResult) {
                    logger.error(
                        '[v1 :: collaboration.service :: manage()] Error',
                    );
                    return {
                        type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                        message:
                            'Internal server error with removing collaborators',
                    };
                }
            }

            logger.info('[v1 :: collaboration.service :: manage()] Success');
            return {
                type: ServiceResponseType.SUCCESS,
                data: null,
            };
        } catch (error) {
            logger.error(
                '[v1 :: collaboration.service :: manage()] Error',
                error,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Leave a project
     * @param projectId
     * @param userId
     * @returns {Promise<ServiceResponse<null>>}
     */
    public async leave(
        projectId: string,
        userId: string,
    ): Promise<ServiceResponse<null>> {
        logger.info(
            `[v1 :: collaboration.service :: leave()] Init with projectId: ${projectId}] and userId: ${userId}]`,
        );

        try {
            const leaveResult = await prisma.collaboration.deleteMany({
                where: {
                    project_id: projectId,
                    profile_id: userId,
                },
            });

            if (!leaveResult) {
                logger.error('[v1 :: collaboration.service :: leave()] Error');
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                };
            }

            logger.info('[v1 :: collaboration.service :: leave()] Success');
            return {
                type: ServiceResponseType.SUCCESS,
                data: null,
            };
        } catch (error) {
            logger.error(
                '[v1 :: collaboration.service :: leave()] Error',
                error,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }
}
