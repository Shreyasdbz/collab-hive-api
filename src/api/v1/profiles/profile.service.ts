import logger from '@utils/logging.util';
import {
    GetProfileDetailsResponseDto,
    GetProfileDetailsResponseDtoProjectCard,
} from './profile.dtos';
import { prisma } from '@config/database.config';
import { CollaborationRelationship } from '@prisma/client';
import { ServiceResponse, ServiceResponseType } from '@models/Response';

/**
 * Profile Service - handles all "Profile" table related operations
 * @class ProfileService
 */
export default class ProfileService {
    /**
     * @description Returns the full profile details of a user
     * @param userId
     * @returns {Promise<ServiceResponse<GetProfileDetailsResponseDto>>}
     */
    public async getDetails(
        userId: string,
    ): Promise<ServiceResponse<GetProfileDetailsResponseDto>> {
        logger.info(
            `[v1 :: profile.service :: getDetails()] Init with userId: ${userId}`,
        );

        try {
            const profileResult = await prisma.profile.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    favorites: {
                        include: {
                            Collaborations: {
                                where: {
                                    relation: CollaborationRelationship.Creator,
                                },
                                include: {
                                    Profile: true,
                                },
                            },
                        },
                    },
                    Collaborations: {
                        where: {
                            OR: [
                                { relation: CollaborationRelationship.Creator },
                                {
                                    relation:
                                        CollaborationRelationship.CollaboratorAccepted,
                                },
                            ],
                        },
                        include: {
                            Project: {
                                include: {
                                    Collaborations: {
                                        where: {
                                            relation:
                                                CollaborationRelationship.Creator,
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
                    },
                },
            });

            if (!profileResult) {
                logger.warn(
                    '[v1 :: profile.service :: getDetails()] No user found',
                );
                return {
                    type: ServiceResponseType.NOT_FOUND,
                    message: 'No user found',
                };
            } else {
                logger.info(
                    `[v1 :: profile.service :: getDetails()] User found.`,
                );
            }

            const favorites: GetProfileDetailsResponseDtoProjectCard[] = [];
            const creatorProjects: GetProfileDetailsResponseDtoProjectCard[] =
                [];
            const collaborationProjects: GetProfileDetailsResponseDtoProjectCard[] =
                [];

            if (profileResult.favorites && profileResult.favorites.length > 0) {
                // map favorites
                profileResult.favorites.forEach((project) => {
                    const creator = project.Collaborations[0].Profile;
                    const projectCard: GetProfileDetailsResponseDtoProjectCard =
                        {
                            id: project.id,
                            name: project.name,
                            creatorName: creator.name,
                            creatorAvatarUrl: creator.avatar_url,
                            updatedAt: project.updated_at.toISOString(),
                            isOpen: project.is_open,
                        };
                    favorites.push(projectCard);
                });
            }

            if (profileResult.Collaborations) {
                // map creator and collaborator projects
                profileResult.Collaborations.forEach((collaboration) => {
                    const project = collaboration.Project;
                    const projectCard: GetProfileDetailsResponseDtoProjectCard =
                        {
                            id: project.id,
                            name: project.name,
                            creatorName: project.Collaborations[0].Profile.name,
                            creatorAvatarUrl:
                                project.Collaborations[0].Profile.avatar_url,
                            updatedAt: project.updated_at.toISOString(),
                            isOpen: project.is_open,
                        };

                    if (
                        collaboration.relation ===
                        CollaborationRelationship.Creator
                    ) {
                        creatorProjects.push(projectCard);
                    } else {
                        collaborationProjects.push(projectCard);
                    }
                });
            }

            const result: GetProfileDetailsResponseDto = {
                id: profileResult.id,
                email: profileResult.email,
                name: profileResult.name,
                avatarUrl: profileResult.avatar_url,
                bio: profileResult.bio,
                favorites,
                activeProjectSlots: profileResult.active_project_slots,
                creatorProjects,
                collaborationProjects,
            };

            return {
                type: ServiceResponseType.SUCCESS,
                data: result,
            };
        } catch (error) {
            logger.error(
                `[v1 :: profile.service :: getDetails()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * @description Updates a user's profile details
     * @param userId: string
     * @param name?: string
     * @param bio?: string
     * @param avatarUrl?: string | null
     * @returns {Promise<ServiceResponse<boolean>>}
     */
    public async updateDetails({
        userId,
        name,
        avatarUrl,
        bio,
    }: {
        userId: string;
        name?: string;
        avatarUrl?: string | null;
        bio?: string;
    }): Promise<ServiceResponse<boolean>> {
        logger.info('[v1 :: profile.service :: updateDetails()] Init');
        logger.info(
            `[v1 :: profile.service :: updateDetails()] userId: ${userId}`,
        );
        logger.info(`[v1 :: profile.service :: updateDetails()] name: ${name}`);
        logger.info(
            `[v1 :: profile.service :: updateDetails()] avatarUrl: ${avatarUrl}`,
        );
        logger.info(`[v1 :: profile.service :: updateDetails()] bio: ${bio}`);

        try {
            const userUpdateResult = await prisma.profile.update({
                where: {
                    id: userId,
                },
                data: {
                    ...(name !== undefined ? { name: name } : {}),
                    ...(avatarUrl !== undefined
                        ? { avatar_url: avatarUrl }
                        : {}),
                    ...(bio !== undefined ? { bio: bio } : {}),
                },
            });

            if (!userUpdateResult) {
                logger.error(
                    '[v1 :: profile.service :: updateDetails()] No user found',
                );
                return {
                    type: ServiceResponseType.NOT_FOUND,
                    message: 'No user found',
                };
            } else {
                logger.info(
                    '[v1 :: profile.service :: updateDetails()] User details updated',
                );
                return {
                    type: ServiceResponseType.SUCCESS,
                    data: true,
                };
            }
        } catch (error) {
            logger.error(
                `[v1 :: profile.service :: updateDetails()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }
}
