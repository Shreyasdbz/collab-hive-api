export interface ModifyProfileStandardResponseDto {
    message: string;
    profileId: string;
}

export interface GetProfileDetailsResponseDtoLink {
    id: string;
    linkType: string;
    linkTitle: string;
    linkUrl: string;
}
export interface GetProfileDetailsResponseDtoProjectCard {
    id: string;
    name: string;
    creatorName: string;
    creatorAvatarUrl: string | null;
    updatedAt: string;
    isOpen: boolean;
}
export interface GetProfileDetailsResponseDto {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    bio: string;
    activeProjectSlots: number;
    favorites: GetProfileDetailsResponseDtoProjectCard[];
    creatorProjects: GetProfileDetailsResponseDtoProjectCard[];
    collaborationProjects: GetProfileDetailsResponseDtoProjectCard[];
    links: GetProfileDetailsResponseDtoLink[];
}

export interface UpdateProfileDetailsRequestDto {
    name?: string;
    bio?: string;
    avatarUrl?: string | null;
}

export interface CreateProfileLinkRequestDto {
    linkType: string;
    linkTitle: string;
    linkUrl: string;
}
