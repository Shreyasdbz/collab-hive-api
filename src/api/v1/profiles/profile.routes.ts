import { Router } from 'express';
import { getProfileDetails, updateProfileDetails } from './profile.controller';

const router = Router();

router.get('/', (_, res) => {
    res.status(200).json({
        message: 'Welcome to the CollabHive API - V1 - profile',
    });
});

/**
 * method - GET
 * path - /api/v1/profiles/:userId
 * description - Get a user's full profile
 */
router.get('/:userId', getProfileDetails);

/**
 * method - PUT
 * path - /api/v1/profiles
 * description - Update a user's profile details
 */
router.put('/', updateProfileDetails);

export default router;
