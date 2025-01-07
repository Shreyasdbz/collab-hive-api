export interface ModifyProjectStandardResponseDto {
    message: string;
    projectId: string;
}

/** GetProjectSearchResult DTOs */
export interface GetProjectSearchResultsRequestDto {
    sortBy: string;
    roles: string[];
    complexities: string[];
    technologies: string[];
    page: number;
    limit: number;
}

export interface GetProjectSearchResultsResponseDtoCreator {
    id: string;
    name: string;
    avatarUrl: string | null;
}
export interface GetProjectSearchResultsResponseDtoCollaborator {
    id: string;
    avatarUrl: string | null;
}
export interface GetProjectSearchResultsResponseDto {
    id: string;
    name: string; // Project title
    complexity: string; // Project complexity id
    technologies: string[]; // Project technology ids
    roles: string[]; // Project role ids
    creator: GetProjectSearchResultsResponseDtoCreator;
    collaborators: GetProjectSearchResultsResponseDtoCollaborator[];
    favoriteCount: number;
    createdAt: string;
}

/** GetProjectDetails DTOs*/
export interface GetProjectDetailsResponseDtoLink {
    id: string;
    linkType: string;
    linkTitle: string;
    linkUrl: string;
}
export interface GetProjectDetailsResponseDtoPerson {
    id: string;
    name: string;
    avatarUrl: string | null;
}
export interface GetProjectDetailsResponseDtoCollaborationRequest {
    id: string;
    sender: GetProjectDetailsResponseDtoPerson;
    message: string;
    isDeclined: boolean;
}
export interface GetProjectDetailsResponseDto {
    id: string;
    name: string; // Project title
    description: string;
    isOpen: boolean;
    complexity: string; // Project complexity id
    roles: string[]; // Project role ids
    technologies: string[]; // Project technology ids
    creator: GetProjectDetailsResponseDtoPerson;
    collaborators: GetProjectDetailsResponseDtoPerson[];
    createdAt: string;
    collaborationRequests: GetProjectDetailsResponseDtoCollaborationRequest[];
    favoriteCount: number;
    userHasFavorited: boolean;
    links: GetProjectDetailsResponseDtoLink[];
}

/** UpdateProjectDetails DTOs */
export interface UpdateProjectDetailsRequestDto {
    name?: string;
    description?: string;
    complexity?: string;
    isOpen?: boolean;
    roles?: string[];
    technologies?: string[];
}

/** CreateProjectLink DTOs */
export interface CreateProjectLinkRequestDto {
    linkType: string;
    linkTitle: string;
    linkUrl: string;
}
