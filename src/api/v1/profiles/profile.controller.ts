import { Request, Response } from 'express';
import { ServiceResponseType } from '@models/Response';
import { supabase } from '@config/supabase.config';
import logger from '@utils/logging.util';
import ProfileService from './profile.service';
import { UpdateProfileDetailsRequestDto } from './profile.dtos';

/**
 * [GET] /api/v1/profiles/:userId
 * Get a user's full profile
 * @param req
 * - params: {userId: string}
 * @param res
 * - Success: 200 {ProfileDetailsResponseDto}
 * - Not Found: 404 {message: string}
 * - Error: 500 {message: string}
 * @returns
 */
export async function getProfileDetails(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: profile.controller :: getProfileDetails()] Init');
    try {
        let userId: string;
        // Try to grab userId from request params
        const userIdFromParam = req.params.userId;
        if (!userIdFromParam) {
            logger.warn(
                '[v1 :: profile.controller :: getProfileDetails()] No userId provided. Trying auth header',
            );
        }

        if (userIdFromParam === 'me') {
            // Try to grab userId from auth header
            const authHeader = req.headers.authorization;
            const { data } = await supabase.auth.getUser(authHeader as string);
            const userIdFromToken = data?.user?.id;
            if (!userIdFromToken) {
                logger.warn(
                    '[v1 :: profile.controller :: getProfileDetails()] Could not parse userId from token',
                );
                res.status(401).json({ message: 'Unauthorized' });
                return;
            } else {
                userId = userIdFromToken;
            }
        } else {
            userId = userIdFromParam;
        }

        const profileService = new ProfileService();
        const profileDetailsResult = await profileService.getDetails(userId);

        switch (profileDetailsResult.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: profile.controller :: getProfileDetails()] Success',
                );
                res.status(200).json(profileDetailsResult.data);
                break;

            case ServiceResponseType.NOT_FOUND:
                logger.info(
                    '[v1 :: profile.controller :: getProfileDetails()] Profile not found',
                );
                res.status(404).json({ message: 'Profile not found' });
                break;

            default:
                logger.error(
                    '[v1 :: profile.controller :: getProfileDetails()] Default case',
                );
                res.status(500).json({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            '[v1 :: profile.controller :: getProfileDetails()] Error',
            error,
        );
        res.status(500).json({ message: 'Something went wrong :(' });
    }
}

/**
 * [PUT] /api/v1/profiles
 * @param req
 * - body: UpdateProfileDetailsRequestDto
 * @param res
 * - Success: 201 {message: string, data: {success: true}}
 * - Not Found: 404 {message: string}
 * - Error: 500 {message: string}
 * @returns
 */
export async function updateProfileDetails(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: profile.controller :: updateProfileDetails()] Init');

    // Grab authorization header from request
    const authHeader = req.headers.authorization;
    const { data } = await supabase.auth.getUser(authHeader as string);
    const userId = data?.user?.id;

    try {
        // Grab request body
        const { name, avatarUrl, bio } =
            req.body as UpdateProfileDetailsRequestDto;
        if (!userId) {
            logger.warn(
                '[v1 :: profile.controller :: updateProfileDetails()] Could not parse userId from token',
            );
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const profileService = new ProfileService();
        const updatedDetails = await profileService.updateDetails({
            userId,
            name,
            avatarUrl,
            bio,
        });

        switch (updatedDetails.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: profile.controller :: updateProfileDetails()] Success',
                );
                res.status(201).json({
                    message: 'Profile updated successfully',
                    data: { success: true },
                });
                break;

            case ServiceResponseType.NOT_FOUND:
                logger.info(
                    '[v1 :: profile.controller :: updateProfileDetails()] Profile not found',
                );
                res.status(404).json({ message: 'Profile not found' });
                break;

            default:
                logger.error(
                    '[v1 :: profile.controller :: updateProfileDetails()] Default case',
                );
                res.status(500).json({ message: 'Something went wrong :(' });
                break;
        }
    } catch (err) {
        logger.error(
            '[v1 :: profile.controller :: updateProfileDetails()] Error',
            err,
        );
        res.status(500).json({ message: 'Something went wrong :(' });
    }
}
