import { Router } from 'express';
import { getProjects, getProject, createProject, getProgress } from './projects.controller.js';

const router = Router();

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.get('/:id/progress', getProgress);

export default router;
