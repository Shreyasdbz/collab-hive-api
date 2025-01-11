import { CollaborationRelationship } from '@prisma/client';
import {
    ProjectComplexitiesMapping,
    ProjectSearchSortByMapping,
} from '@models/project-mappings';
import { ServiceResponse, ServiceResponseType } from '@models/Response';
import {
    GetProjectDetailsResponseDto,
    GetProjectDetailsResponseDtoPerson,
    GetProjectSearchResultsResponseDto,
} from './project.dtos';
import { prisma } from '@config/database.config';
import { GetProjectDetailsResponseDtoCollaborationRequest } from './project.dtos';
import logger from '@utils/logging.util';
import { GetProfileDetailsResponseDtoLink } from '../profiles/profile.dtos';
import { getRedisClient } from '@config/redis.config';

/**
 * Project Service - handles all "Project" table related operations
 * @class ProjectService
 * @exports ProjectService
 */
export default class ProjectService {
    private redis = getRedisClient();
    private REDIS_PROJECT_CACHE_KEY_BASIC = 'projects-search:';

    // Invalidates all keys associated with project search
    private async invalidateProjectsCache() {
        const pattern = `${this.REDIS_PROJECT_CACHE_KEY_BASIC}*`;
        let cursor = '0';
        let keysToDelete: string[] = [];
        do {
            const response = await this.redis.scan(cursor, {
                match: pattern,
                count: 100,
            });

            cursor = response[0]; // Next cursor
            keysToDelete = keysToDelete.concat(response[1]); // Matching keys
        } while (cursor !== '0');

        // Delete all keys in batches
        if (keysToDelete.length > 0) {
            const deletePromises = keysToDelete.map((key) =>
                this.redis.del(key),
            );
            await Promise.all(deletePromises);
        }
        logger.info(
            `[v1 :: project.service :: invalidateProjectsCache()] Cache invalidated`,
        );
    }

    /**
     * Finds projects with given filters and sorts them
     * @param roles? - Project open roles
     * @param complexities? - Project complexities
     * @param technologies? - Project technologies
     * @param sortBy - Sort by
     * @param page - Page number
     * @param limit - Number of projects per page
     * @returns {Promise<ServiceResponse<GetProjectSearchResultsResponseDto[]>>}
     */
    public async find({
        roles,
        complexities,
        technologies,
        sortBy,
        page,
        limit,
    }: {
        roles?: string[];
        complexities?: string[];
        technologies?: string[];
        sortBy: string;
        page: number;
        limit: number;
    }): Promise<ServiceResponse<GetProjectSearchResultsResponseDto[]>> {
        logger.info('[v1 :: project.service :: find()] Init');
        const userFilters: {
            isOpen: boolean;
            rolesOpen?: string[];
            complexities?: string[];
            technologies?: string[];
        } = {
            isOpen: true,
            rolesOpen: roles,
            complexities: complexities,
            technologies: technologies,
        };

        // Check with Redis cache for this query
        const queryString = JSON.stringify({
            roles,
            complexities,
            technologies,
            sortBy,
            page,
            limit,
        });
        const cacheKey = `${this.REDIS_PROJECT_CACHE_KEY_BASIC}${queryString}`;
        const cachedProjects = await this.redis.get(cacheKey);
        if (cachedProjects) {
            logger.info(
                `[v1 :: project.service :: find()] Found cached projects for query: ${queryString}`,
            );
            return {
                type: ServiceResponseType.SUCCESS,
                data: cachedProjects as unknown as GetProjectSearchResultsResponseDto[],
            };
        } else {
            logger.info(
                `[v1 :: project.service :: find()] No cached projects found for query: ${queryString}`,
            );
        }

        // Figure out sort by based on the mapping
        const sortByValue = ProjectSearchSortByMapping.get(sortBy);
        const sortByClause: any = {
            ...(sortByValue === 'Newest'
                ? {
                      created_at: 'desc',
                  }
                : {}),
            ...(sortByValue === 'Oldest'
                ? {
                      created_at: 'asc',
                  }
                : {}),
        };

        try {
            const projectsResult = await prisma.project.findMany({
                where: {
                    is_open: userFilters.isOpen,
                    ...(userFilters.rolesOpen?.length
                        ? {
                              roles_open: {
                                  hasSome: userFilters.rolesOpen,
                              },
                          }
                        : {}),
                    ...(userFilters.complexities?.length
                        ? {
                              complexity: {
                                  in: userFilters.complexities,
                              },
                          }
                        : {}),
                    ...(userFilters.technologies?.length
                        ? {
                              technologies: {
                                  hasSome: userFilters.technologies,
                              },
                          }
                        : {}),
                },
                include: {
                    favorited_by: true,
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
                orderBy: sortByClause,
            });

            if (projectsResult === null) {
                logger.error(
                    '[v1 :: project.service :: find()] Error fetching projects',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Error fetching projects',
                };
            }
            if (projectsResult.length === 0) {
                logger.info(
                    '[v1 :: project.service :: find()] No projects found with given filters',
                );
                return {
                    type: ServiceResponseType.NOT_FOUND,
                    message: 'No projects found with given filters',
                };
            }

            // If sortBy is favorite, custom sort
            if (sortByValue === 'Most favorites') {
                projectsResult.sort((a, b) => {
                    return b.favorited_by.length - a.favorited_by.length;
                });
            }

            // Map the results to the response DTO
            const projectSearchResults: GetProjectSearchResultsResponseDto[] =
                projectsResult.map((project) => {
                    let creator: GetProjectDetailsResponseDtoPerson = {
                        id: '',
                        name: '',
                        avatarUrl: '',
                    };
                    let collaborators: GetProjectDetailsResponseDtoPerson[] =
                        [];

                    project.collaborations.map((collaboration) => {
                        if (
                            collaboration.relation ===
                            CollaborationRelationship.Creator
                        ) {
                            creator = {
                                id: collaboration.Profile.id,
                                name: collaboration.Profile.name,
                                avatarUrl: collaboration.Profile.avatar_url,
                            };
                        } else if (
                            collaboration.relation ===
                            CollaborationRelationship.CollaboratorAccepted
                        ) {
                            collaborators.push({
                                id: collaboration.Profile.id,
                                name: collaboration.Profile.name,
                                avatarUrl: collaboration.Profile.avatar_url,
                            });
                        }
                        return null;
                    });

                    return {
                        id: project.id,
                        name: project.name,
                        complexity: project.complexity,
                        technologies: project.technologies,
                        roles: project.roles_open,
                        creator: creator,
                        collaborators: collaborators,
                        favoriteCount: project.favorited_by.length,
                        createdAt: project.created_at.toISOString(),
                    };
                });

            logger.info(
                `[v1 :: project.service :: find()] ${projectSearchResults.length} projects found with given filters`,
            );

            // Cache the results
            await this.redis.set(
                cacheKey,
                JSON.stringify(projectSearchResults),
                {
                    ex: 60 * 5, // 5 minutes
                },
            );
            return {
                type: ServiceResponseType.SUCCESS,
                data: projectSearchResults,
            };
        } catch (error) {
            logger.error(`[v1 :: project.service :: find()] Error: ${error}`);
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Fetches full details of a project. If the user is not the creator of the project, collaboration requests are not returned
     * @param projectId - Project ID
     * @returns {Promise<ServiceResponse<GetProjectDetailsResponseDto>>}
     */
    public async getDetails({
        projectId,
        userId,
    }: {
        projectId: string;
        userId?: string;
    }): Promise<ServiceResponse<GetProjectDetailsResponseDto>> {
        logger.info(
            `[v1 :: project.service :: getDetails()] Init with projectId: ${projectId} and userId: ${userId}`,
        );

        try {
            const getProjectResult = await prisma.project.findUnique({
                where: {
                    id: projectId,
                },
                include: {
                    links: true,
                    favorited_by: true,
                    collaborations: {
                        where: {
                            project_id: projectId,
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
            });
            if (!getProjectResult) {
                logger.error(
                    '[v1 :: project.service :: getDetails()] Error fetching project',
                );
                return {
                    type: ServiceResponseType.NOT_FOUND,
                    message: 'Project not found',
                };
            }

            logger.info(
                `[v1 :: project.service :: getDetails()] project found.`,
            );

            let creator: GetProjectDetailsResponseDtoPerson = {
                id: '',
                name: '',
                avatarUrl: '',
            };
            let collaborators: GetProjectDetailsResponseDtoPerson[] = [];
            let collaborationRequests: GetProjectDetailsResponseDtoCollaborationRequest[] =
                [];

            let links: GetProfileDetailsResponseDtoLink[] = [];
            getProjectResult.links.map((link) => {
                links.push({
                    id: link.id,
                    linkType: link.link_type,
                    linkTitle: link.title,
                    linkUrl: link.url,
                });
            });

            getProjectResult.collaborations.map((collaboration) => {
                if (
                    collaboration.relation === CollaborationRelationship.Creator
                ) {
                    creator = {
                        id: collaboration.Profile.id,
                        name: collaboration.Profile.name,
                        avatarUrl: collaboration.Profile.avatar_url,
                    };
                } else if (
                    collaboration.relation ===
                    CollaborationRelationship.CollaboratorAccepted
                ) {
                    collaborators.push({
                        id: collaboration.Profile.id,
                        name: collaboration.Profile.name,
                        avatarUrl: collaboration.Profile.avatar_url,
                    });
                } else if (
                    collaboration.relation ===
                    CollaborationRelationship.CollaboratorPending
                ) {
                    collaborationRequests.push({
                        id: collaboration.Profile.id,
                        sender: {
                            id: collaboration.Profile.id,
                            name: collaboration.Profile.name,
                            avatarUrl: collaboration.Profile.avatar_url,
                        },
                        message: collaboration.request_message
                            ? collaboration.request_message
                            : '',
                        isDeclined: false,
                    });
                } else if (
                    collaboration.relation ===
                    CollaborationRelationship.CollaboratorDeclined
                ) {
                    collaborationRequests.push({
                        id: collaboration.Profile.id,
                        sender: {
                            id: collaboration.Profile.id,
                            name: collaboration.Profile.name,
                            avatarUrl: collaboration.Profile.avatar_url,
                        },
                        message: collaboration.request_message
                            ? collaboration.request_message
                            : '',
                        isDeclined: true,
                    });
                }
            });

            // If the user is not the creator of the project, remove collaboration requests
            if (userId !== creator.id) {
                collaborationRequests = [];
            }

            function getUserHasFavorited() {
                if (userId && getProjectResult) {
                    return getProjectResult.favorited_by.some(
                        (fav) => fav.profile_id === userId,
                    );
                }
                return false;
            }

            const projectDetails: GetProjectDetailsResponseDto = {
                id: getProjectResult.id,
                name: getProjectResult.name,
                description: getProjectResult.description,
                isOpen: getProjectResult.is_open,
                complexity: getProjectResult.complexity,
                roles: getProjectResult.roles_open,
                technologies: getProjectResult.technologies,
                creator: creator,
                collaborators: collaborators,
                createdAt: getProjectResult.created_at.toISOString(),
                collaborationRequests: collaborationRequests,
                favoriteCount: getProjectResult.favorited_by.length,
                userHasFavorited: getUserHasFavorited(),
                links: links,
            };

            return {
                type: ServiceResponseType.SUCCESS,
                data: projectDetails,
            };
        } catch (error) {
            logger.error(
                `[v1 :: project.service :: getDetails()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Creates a new project and returns the project id
     * @param userId - User ID
     * @param newProjectName - New project name
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async createNew({
        userId,
        newProjectName,
    }: {
        userId: string;
        newProjectName: string;
    }): Promise<ServiceResponse<string>> {
        logger.info('[v1 :: project.service :: createNew()] Init');
        logger.info(
            `[v1 :: project.service :: createNew()] newProjectName: ${newProjectName}`,
        );

        try {
            const newProjectResult = await prisma.project.create({
                data: {
                    name: newProjectName,
                    description: '',
                    complexity: [...ProjectComplexitiesMapping.entries()][0][0],
                    is_open: false,
                    roles_open: [],
                    technologies: [],
                },
            });
            logger.info(
                `[v1 :: project.service :: createNew()] new project created successfully`,
            );
            if (!newProjectResult || !newProjectResult.id) {
                logger.error(
                    '[v1 :: project.service :: createNew()] Error creating new project',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Project creation failed',
                };
            }

            // Create new collaboration
            const newCollaborationResult = await prisma.collaboration.create({
                data: {
                    profile_id: userId,
                    project_id: newProjectResult.id,
                    relation: CollaborationRelationship.Creator,
                    request_message: '',
                },
            });
            logger.info(
                `[v1 :: project.service :: createNew()] new collaboration created successfully`,
            );
            if (!newCollaborationResult || !newCollaborationResult.id) {
                logger.error(
                    '[v1 :: project.service :: createNew()] Error creating new collaboration',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Project creation failed',
                };
            }

            logger.info(
                `[v1 :: project.service :: createNew()] newProjectId: ${newProjectResult.id}`,
            );
            // Invalidate the cache
            await this.invalidateProjectsCache();
            return {
                type: ServiceResponseType.SUCCESS,
                data: newProjectResult.id,
            };
        } catch (error) {
            logger.error(
                `[v1 :: project.service :: createNew()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Project creation failed',
            };
        }
    }

    /**
     * Toggles the favorite status of a project by the user
     * @param userId - User ID
     * @param projectId - Project ID
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async toggleFavorite({
        userId,
        projectId,
    }: {
        userId: string;
        projectId: string;
    }): Promise<ServiceResponse<string>> {
        logger.info(
            `[v1 :: project.service :: favorite()] Init with userId: ${userId} and projectId: ${projectId}`,
        );

        try {
            const projectResult = await prisma.project.findUnique({
                where: {
                    id: projectId,
                },
                include: {
                    collaborations: {
                        where: {
                            relation: CollaborationRelationship.Creator,
                        },
                    },
                    favorited_by: true,
                },
            });
            if (!projectResult) {
                return {
                    type: ServiceResponseType.NOT_FOUND,
                    message: 'Project not found',
                };
            }

            const userHasFavoritedProject = projectResult.favorited_by.some(
                (fav) => fav.profile_id === userId,
            );

            if (!userHasFavoritedProject) {
                // User has not favorited the project, add the favorite
                // --> check if user is owner of project
                if (projectResult.collaborations[0].profile_id === userId) {
                    return {
                        type: ServiceResponseType.FORBIDDEN,
                        message: 'Cannot favorite your own project',
                    };
                }
                // Create new favorite
                const newFavoriteResult = await prisma.favorite.create({
                    data: {
                        profile_id: userId,
                        project_id: projectId,
                    },
                });
                if (!newFavoriteResult) {
                    logger.error(
                        '[v1 :: project.service :: favorite()] Error creating new favorite',
                    );
                    return {
                        type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                        message: 'Internal server error',
                    };
                } else {
                    logger.info(
                        '[v1 :: project.service :: favorite()] Project favorited successfully',
                    );
                    return {
                        type: ServiceResponseType.SUCCESS,
                        data: 'Project added to favorites.',
                    };
                }
            } else {
                // User has already favorited the project, remove the favorite
                const deleteFavoriteResult = await prisma.favorite.deleteMany({
                    where: {
                        profile_id: userId,
                        project_id: projectId,
                    },
                });
                if (!deleteFavoriteResult) {
                    logger.error(
                        '[v1 :: project.service :: favorite()] Error deleting favorite',
                    );
                    return {
                        type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                        message: 'Internal server error',
                    };
                } else {
                    logger.info(
                        '[v1 :: project.service :: favorite()] Project removed from favorites successfully',
                    );
                    return {
                        type: ServiceResponseType.SUCCESS,
                        data: 'Project removed from favorites.',
                    };
                }
            }
        } catch (error) {
            logger.error(
                `[v1 :: project.service :: favorite()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Update project details
     * @param projectId - Project ID
     * @param name? - Project name
     * @param description? - Project description
     * @param isOpen? - Project open status
     * @param complexity? - Project complexity
     * @param roles? - Project open roles
     * @param technologies? - Project technologies
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async updateDetails({
        projectId,
        name,
        description,
        isOpen,
        complexity,
        roles,
        technologies,
    }: {
        projectId: string;
        name?: string;
        description?: string;
        isOpen?: boolean;
        complexity?: string;
        roles?: string[];
        technologies?: string[];
    }): Promise<ServiceResponse<string>> {
        logger.info(
            `[v1 :: project.service :: updateDetails()] Init with projectId: ${projectId}`,
        );

        try {
            const updatedProjectResult = await prisma.project.update({
                where: {
                    id: projectId,
                },
                data: {
                    ...(name !== undefined
                        ? {
                              name: name,
                          }
                        : {}),
                    ...(description !== undefined
                        ? {
                              description: description,
                          }
                        : {}),
                    ...(isOpen !== undefined
                        ? {
                              is_open: isOpen,
                          }
                        : {}),
                    ...(complexity
                        ? {
                              complexity: complexity,
                          }
                        : {}),
                    ...(roles
                        ? {
                              roles_open: roles,
                          }
                        : {}),
                    ...(technologies
                        ? {
                              technologies: technologies,
                          }
                        : {}),
                },
            });
            if (updatedProjectResult === null) {
                logger.error(
                    '[v1 :: project.service :: updateDetails()] Error updating project',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Error updating project',
                };
            } else {
                logger.info(
                    '[v1 :: project.service :: updateDetails()] Project updated successfully',
                );
                // Invalidate the cache
                await this.invalidateProjectsCache();
                return {
                    type: ServiceResponseType.SUCCESS,
                    data: 'Project updated successfully',
                };
            }
        } catch (error) {
            logger.error(
                `[v1 :: project.service :: updateDetails()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Deletes a project
     * @param projectId - Project ID
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async delete({
        projectId,
    }: {
        projectId: string;
    }): Promise<ServiceResponse<string>> {
        logger.info('[v1 :: project.service :: delete()] Init');
        logger.info(
            `[v1 :: project.service :: delete()] projectId: ${projectId}`,
        );

        try {
            // Step 1: delete collaboration
            const deleteCollaborationResult =
                await prisma.collaboration.deleteMany({
                    where: {
                        project_id: projectId,
                    },
                });
            if (!deleteCollaborationResult) {
                logger.error(
                    '[v1 :: project.service :: delete()] Error deleting collaborations',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Collaboration delete failed',
                };
            }

            // Step 2: delete project
            const deleteProjectResult = await prisma.project.delete({
                where: {
                    id: projectId,
                },
            });
            if (!deleteProjectResult) {
                logger.error(
                    '[v1 :: project.service :: delete()] Error deleting project',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Project delete failed',
                };
            }

            logger.info(
                '[v1 :: project.service :: delete()] Project deleted successfully',
            );
            // Invalidate the cache
            await this.invalidateProjectsCache();
            return {
                type: ServiceResponseType.SUCCESS,
                data: 'Project deleted.',
            };
        } catch (error) {
            logger.error(`[v1 :: project.service :: delete()] Error: ${error}`);
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Project delete failed',
            };
        }
    }

    /**
     * Adds a new link to a project
     * @param projectId - Project ID
     * @param linkType - Link type
     * @param linkTitle - Link title
     * @param linkUrl - Link URL
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async addLink({
        projectId,
        linkType,
        linkTitle,
        linkUrl,
    }: {
        projectId: string;
        linkType: string;
        linkTitle: string;
        linkUrl: string;
    }): Promise<ServiceResponse<string>> {
        try {
            const newLinkResult = await prisma.attachmentLink.create({
                data: {
                    projectId: projectId,
                    link_type: linkType,
                    title: linkTitle,
                    url: linkUrl,
                },
            });
            if (!newLinkResult) {
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                };
            } else {
                return {
                    type: ServiceResponseType.SUCCESS,
                    data: 'Link added successfully',
                };
            }
        } catch (error) {
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }

    /**
     * Deletes a link from a project
     * @param linkId - Link ID
     * @returns {Promise<ServiceResponse<string>>}
     */
    public async deleteLink({
        linkId,
    }: {
        linkId: string;
    }): Promise<ServiceResponse<string>> {
        try {
            const deleteLinkResult = await prisma.attachmentLink.delete({
                where: {
                    id: linkId,
                },
            });
            if (!deleteLinkResult) {
                logger.error(
                    '[v1 :: project.service :: deleteLink()] Error deleting link',
                );
                return {
                    type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                };
            } else {
                logger.info(
                    '[v1 :: project.service :: deleteLink()] Link deleted successfully',
                );
                return {
                    type: ServiceResponseType.SUCCESS,
                    data: 'Link deleted successfully',
                };
            }
        } catch (error) {
            logger.error(
                `[v1 :: project.service :: deleteLink()] Error: ${error}`,
            );
            return {
                type: ServiceResponseType.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            };
        }
    }
}
