export interface GetCreatorProjectCollaborationRequestsResponseDto {
    projectId: string;
    projectName: string;
    numberOfRequests: number;
}
export interface GetProjectCardResponseDtoCollaborator {
    id: string;
    name: string;
    avatarUrl: string;
}
export interface GetCreatorProjectCardResponseDto {
    id: string;
    name: string;
    technologies: string[];
    collaborators: GetProjectCardResponseDtoCollaborator[];
    isOpen: boolean;
    numberOfActiveJoinRequests: number;
}

export interface GetCollaboratorProjectCardResponseDto {
    id: string;
    name: string;
    technologies: string[];
    creatorName: string;
    creatorAvatarUrl: string;
    collaborators: GetProjectCardResponseDtoCollaborator[];
}

export interface ManageCollaborationRequestDto {
    requestsAccepted: string[];
    requestsDeclined: string[];
    collaboratorsRemoved: string[];
}
