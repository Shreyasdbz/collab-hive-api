import { Request, Response } from 'express';
import logger from '@utils/logging.util';
import AuthService from './auth.service';
import { ServiceResponseType } from '@models/Response';

/**
 * [GET] /api/v1/auth?code=string&next=string
 * @param req
 * @param res
 */
export async function exchangeCodeForSession(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('[v1 :: auth.controller :: exchangeCodeForSession()] Init');

    try {
        // Try to grab authCode from request params
        const { code: authCode } = req.query as { code: string };
        if (!authCode) {
            logger.warn(
                '[v1 :: auth.controller :: exchangeCodeForSession()] No authCode provided',
            );
            res.status(400).json({ message: 'No auth code' });
            return;
        }

        const authService = new AuthService();
        const sessionResult = await authService.getSession(authCode);

        switch (sessionResult.type) {
            case ServiceResponseType.SUCCESS:
                logger.info(
                    '[v1 :: auth.controller :: exchangeCodeForSession()] Success',
                );
                res.status(200).json(sessionResult.data);
                break;
            case ServiceResponseType.UNAUTHORIZED:
                logger.warn(
                    '[v1 :: auth.controller :: exchangeCodeForSession()] Unauthorized',
                );
                res.status(401).json({ message: 'Unauthorized' });
                break;
            case ServiceResponseType.NOT_FOUND:
                logger.warn(
                    '[v1 :: auth.controller :: exchangeCodeForSession()] User not found',
                );
                res.status(404).json({ message: 'User not found' });
                break;
            default:
                logger.error(
                    '[v1 :: auth.controller :: exchangeCodeForSession()] Internal server error',
                );
                res.status(500).json({ message: 'Internal server error' });
                break;
        }
    } catch (error) {
        logger.error(
            `[v1 :: auth.controller :: exchangeCodeForSession()] Error: ${error}`,
        );
        res.status(500).json({ message: 'Internal server error' });
    }
}
