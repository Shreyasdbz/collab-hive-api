import logger from '@utils/logging.util';
import { NextFunction, Request, Response } from 'express';
import { supabase } from '@config/supabase.config';

const authValidation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            logger.error(
                '[auth.middlware :: authValidation()] No token provided',
            );
            res.status(401).json({ message: 'Unauthorized' });
            next();
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (data.user !== null) {
            req.body = { ...req.body, verifiedUser: data };
            next();
        }

        if (error) {
            logger.error('[auth.middlware :: authValidation()] Error: ', error);
            res.status(401).json({ message: 'Unauthorized' });
            next();
        }

        logger.error('[auth.middlware :: authValidation()] Uncaught error');
        res.status(500).json({ message: 'Internal server error' });
    } catch (error) {
        logger.error('[auth.middlware :: authValidation()] Error: ', error);
        res.status(500).json({ message: 'Internal server error' });
        next();
    }
};

export { authValidation };
