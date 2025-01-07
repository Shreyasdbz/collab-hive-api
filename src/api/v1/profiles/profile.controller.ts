import { Request, Response } from 'express';
import { ServiceResponseType } from '@models/Response';
import { supabase } from '@config/supabase.config';
import logger from '@utils/logging.util';
import ProfileService from './profile.service';
import {
    CreateProfileLinkRequestDto,
    ModifyProfileStandardResponseDto,
    UpdateProfileDetailsRequestDto,
} from './profile.dtos';

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
                res.status(401).send({ message: 'Unauthorized' });
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
                res.status(200).send(profileDetailsResult.data);
                break;

            case ServiceResponseType.NOT_FOUND:
                logger.info(
                    '[v1 :: profile.controller :: getProfileDetails()] Profile not found',
                );
                res.status(404).send({ message: 'Profile not found' });
                break;

            default:
                logger.error(
                    '[v1 :: profile.controller :: getProfileDetails()] Default case',
                );
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (error) {
        logger.error(
            '[v1 :: profile.controller :: getProfileDetails()] Error',
            error,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}

/**
 * [PUT] /api/v1/profiles
 * @param req
 * - body: UpdateProfileDetailsRequestDto
 * @param res
 * - Success: 200 { ModifyProfileStandardResponseDto }
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
            res.status(401).send({ message: 'Unauthorized' });
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
                const successResponse: ModifyProfileStandardResponseDto = {
                    message: updatedDetails.data,
                    profileId: userId,
                };
                res.status(200).send({ data: successResponse });
                break;

            case ServiceResponseType.NOT_FOUND:
                logger.info(
                    '[v1 :: profile.controller :: updateProfileDetails()] Profile not found',
                );
                res.status(404).send({ message: 'Profile not found' });
                break;

            default:
                logger.error(
                    '[v1 :: profile.controller :: updateProfileDetails()] Default case',
                );
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (err) {
        logger.error(
            '[v1 :: profile.controller :: updateProfileDetails()] Error',
            err,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}

/**
 * [POST] /api/v1/profiles/links
 * @param req
 * - body: { CreateProfileLinkRequestDto }
 * @param res
 * - Success: 201 { ModifyProfileStandardResponseDto }
 * - Bad Request: 400 {message: string}
 * - Error: 500 {message: string}
 */
export async function createProfileLink(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: profile.controller :: createProfileLink()] Init');
    try {
        // Grab authorization header from request
        const authHeader = req.headers.authorization;
        const { data } = await supabase.auth.getUser(authHeader as string);
        const userId = data?.user?.id;
        if (!userId) {
            logger.warn(
                '[v1 :: profile.controller :: createProfileLink()] Could not parse userId from token',
            );
            res.status(401).send({ message: 'Unauthorized' });
            return;
        }

        // Grab and validate request body
        const { linkType, linkTitle, linkUrl } =
            req.body as CreateProfileLinkRequestDto;
        if (!linkType || !linkTitle || !linkUrl) {
            logger.warn(
                '[v1 :: profile.controller :: createProfileLink()] Missing required fields',
            );
            res.status(400).send({ message: 'Missing required fields' });
            return;
        }

        const profileService = new ProfileService();
        const result = await profileService.addLink({
            userId,
            linkType,
            linkTitle,
            linkUrl,
        });

        switch (result.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: profile.controller :: createProfileLink()] Success',
                );
                const successResponse: ModifyProfileStandardResponseDto = {
                    message: result.data,
                    profileId: userId,
                };
                res.status(201).send({ data: successResponse });
                break;
            case ServiceResponseType.BAD_REQUEST:
                logger.warn(
                    '[v1 :: profile.controller :: createProfileLink()] Bad Request',
                );
                res.status(400).send({ message: result.message });
            case ServiceResponseType.NOT_FOUND:
                logger.warn(
                    '[v1 :: profile.controller :: createProfileLink()] Not Found',
                );
                res.status(404).send({ message: 'Profile not found' });
                break;
            default:
                logger.error(
                    '[v1 :: profile.controller :: createProfileLink()] Default case',
                );
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (err) {
        logger.error(
            '[v1 :: profile.controller :: createProfileLink()] Error',
            err,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}

/**
 * [DELETE] /api/v1/profiles/links/:linkId
 * @param req
 * - params: {linkId: string}
 * @param res
 * - Success: 200 { ModifyProfileStandardResponseDto }
 * - Not Found: 404 {message: string}
 * - Error: 500 {message: string}
 */
export async function deleteProfileLink(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: profile.controller :: deleteProfileLink()] Init');
    try {
        // Grab authorization header from request
        const authHeader = req.headers.authorization;
        const { data } = await supabase.auth.getUser(authHeader as string);
        const userId = data?.user?.id;
        if (!userId) {
            logger.warn(
                '[v1 :: profile.controller :: deleteProfileLink()] Could not parse userId from token',
            );
            res.status(401).send({ message: 'Unauthorized' });
            return;
        }

        // Grab linkId from request params
        const linkId = req.params.linkId;
        if (!linkId) {
            logger.warn(
                '[v1 :: profile.controller :: deleteProfileLink()] No linkId provided',
            );
            res.status(400).send({ message: 'Missing linkId' });
            return;
        }

        const profileService = new ProfileService();
        const result = await profileService.removeLink({
            userId,
            linkId,
        });

        switch (result.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: profile.controller :: deleteProfileLink()] Success',
                );
                const successResponse: ModifyProfileStandardResponseDto = {
                    message: result.data,
                    profileId: userId,
                };
                res.status(200).send({ data: successResponse });
                break;

            case ServiceResponseType.NOT_FOUND:
                logger.info(
                    '[v1 :: profile.controller :: deleteProfileLink()] Profile not found',
                );
                res.status(404).send({ message: 'Profile not found' });
                break;

            default:
                logger.error(
                    '[v1 :: profile.controller :: deleteProfileLink()] Default case',
                );
                res.status(500).send({ message: 'Something went wrong :(' });
                break;
        }
    } catch (err) {
        logger.error(
            '[v1 :: profile.controller :: deleteProfileLink()] Error',
            err,
        );
        res.status(500).send({ message: 'Something went wrong :(' });
    }
}
