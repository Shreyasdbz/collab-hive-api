import { Router } from 'express';

import { v0Routes } from './v0';
import { v1Routes } from './v1';

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the CollabHive API',
        availableRoutes: ['/v0', '/v1'],
    });
});

router.use('/v0', v0Routes);
router.use('/v1', v1Routes);

export default router;
