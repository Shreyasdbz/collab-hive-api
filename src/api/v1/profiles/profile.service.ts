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
                    // Get projects that the user has favorited
                    favorites: {
                        include: {
                            Project: {
                                include: {
                                    collaborations: {
                                        where: {
                                            relation:
                                                CollaborationRelationship.Creator,
                                        },
                                        include: {
                                            Profile: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    // Get all projects that the user is a part of
                    collaborations: {
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
                                    collaborations: {
                                        where: {
                                            relation:
                                                CollaborationRelationship.Creator,
                                        },
                                        include: {
                                            Profile: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    // links
                    links: true,
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

            const profileLinks = profileResult.links.map((link) => {
                return {
                    id: link.id,
                    linkType: link.link_type,
                    linkTitle: link.title,
                    linkUrl: link.url,
                };
            });

            const favorites: GetProfileDetailsResponseDtoProjectCard[] = [];
            const creatorProjects: GetProfileDetailsResponseDtoProjectCard[] =
                [];
            const collaborationProjects: GetProfileDetailsResponseDtoProjectCard[] =
                [];

            // map favorites
            if (profileResult.favorites && profileResult.favorites.length > 0) {
                profileResult.favorites.forEach((fav) => {
                    favorites.push({
                        id: fav.Project.id,
                        name: fav.Project.name,
                        creatorName: fav.Project.collaborations[0].Profile.name,
                        creatorAvatarUrl:
                            fav.Project.collaborations[0].Profile.avatar_url,
                        updatedAt: fav.Project.updated_at.toISOString(),
                        isOpen: fav.Project.is_open,
                    });
                });
            }

            if (profileResult.collaborations) {
                // map creator and collaborator projects
                profileResult.collaborations.forEach((collaboration) => {
                    if (
                        collaboration.relation ===
                        CollaborationRelationship.Creator
                    ) {
                        // Add to creator projects
                        creatorProjects.push({
                            id: collaboration.Project.id,
                            name: collaboration.Project.name,
                            creatorName: profileResult.name,
                            creatorAvatarUrl: profileResult.avatar_url,
                            updatedAt:
                                collaboration.Project.updated_at.toISOString(),
                            isOpen: collaboration.Project.is_open,
                        });
                    } else if (
                        collaboration.relation ===
                        CollaborationRelationship.CollaboratorAccepted
                    ) {
                        // Add to collaboration projects
                        collaborationProjects.push({
                            id: collaboration.Project.id,
                            name: collaboration.Project.name,
                            creatorName:
                                collaboration.Project.collaborations[0].Profile
                                    .name,
                            creatorAvatarUrl:
                                collaboration.Project.collaborations[0].Profile
                                    .avatar_url,
                            updatedAt:
                                collaboration.Project.updated_at.toISOString(),
                            isOpen: collaboration.Project.is_open,
                        });
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
                links: profileLinks,
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
     * @returns {Promise<ServiceResponse<string>>}
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
    }): Promise<ServiceResponse<string>> {
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
                    data: 'User details updated',
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

    /**
     * @description Add a link to the user's profile
     * @param userId: string
     * @param linkType: string - identifier for the link
     * @param linkUrl: string - full site url
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async addLink({
        userId,
        linkType,
        linkTitle,
        linkUrl,
    }: {
        userId: string;
        linkType: string;
        linkTitle: string;
        linkUrl: string;
    }): Promise<ServiceResponse<string>> {
        logger.info(
            `[v1 :: profile.service :: addLink()] Init with userId: ${userId}, linkType: ${linkType}, linkUrl: ${linkUrl}`,
        );

        try {
            const linkResult = await prisma.attachmentLink.create({
                data: {
                    link_type: linkType,
                    title: linkTitle,
                    url: linkUrl,
                    profileId: userId,
                },
            });
            if (!linkResult) {
                logger.error(
                    '[v1 :: profile.service :: addLink()] Error adding link',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                };
            } else {
                logger.info(
                    '[v1 :: profile.service :: addLink()] Link added successfully',
                );
                return {
                    type: ServiceResponseType.SUCCESS,
                    data: 'Link added successfully',
                };
            }
        } catch (error) {
            logger.error(
                `[v1 :: profile.service :: addLink()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * @description Remove a link from the user's profile
     * @param userId: string
     * @param linkId: string
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async removeLink({
        userId,
        linkId,
    }: {
        userId: string;
        linkId: string;
    }): Promise<ServiceResponse<string>> {
        logger.info(
            `[v1 :: profile.service :: removeLink()] Init with userId: ${userId}, linkId: ${linkId}`,
        );

        try {
            const linkResult = await prisma.attachmentLink.delete({
                where: {
                    id: linkId,
                    profileId: userId,
                },
            });
            if (!linkResult) {
                logger.error(
                    '[v1 :: profile.service :: removeLink()] Error removing link',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                };
            } else {
                logger.info(
                    '[v1 :: profile.service :: removeLink()] Link removed successfully',
                );
                return {
                    type: ServiceResponseType.SUCCESS,
                    data: 'Link removed successfully',
                };
            }
        } catch (error) {
            logger.error(
                `[v1 :: profile.service :: removeLink()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }
}
