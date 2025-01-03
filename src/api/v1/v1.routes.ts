import { Router } from 'express';
import profileRoutes from './profiles/profile.routes';
import projectRoutes from './projects/project.routes';
import collaborationRoutes from './collaboration/collaboration.routes';

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the CollabHive API V1',
        availableRoutes: ['/profiles', '/projects', '/collaboration'],
    });
});

router.use('/profiles', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/collaboration', collaborationRoutes);

export default router;
