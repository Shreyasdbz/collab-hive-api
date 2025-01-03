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
}

export interface UpdateProfileDetailsRequestDto {
    name?: string;
    bio?: string;
    avatarUrl?: string | null;
}
