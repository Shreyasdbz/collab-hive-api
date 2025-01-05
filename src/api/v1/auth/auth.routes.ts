import { Router } from 'express';
import { exchangeCodeForSession } from './auth.controller';

const router = Router();

/**
 * method - GET
 * path - /api/v1/auth?code=string
 * description - Exchange an auth code for a session
 */
router.get('/', exchangeCodeForSession);

export default router;
