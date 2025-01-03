export interface GetCreatorProjectCollaborationRequestsResponseDto {
    projectId: string;
    projectName: string;
    numberOfRequests: number;
}

export interface GetCreatorProjectCardResponseDto {
    id: string;
    name: string;
    technologyStackText: string;
    collaboratorsText: string;
    isOpen: boolean;
}

export interface GetCollaboratorProjectCardResponseDto {
    id: string;
    name: string;
    technologyStackText: string;
    creatorName: string;
    collaboratorsText: string;
}

export interface ManageCollaborationRequestDto {
    requestsAccepted: string[];
    requestsDeclined: string[];
    collaboratorsRemoved: string[];
}
