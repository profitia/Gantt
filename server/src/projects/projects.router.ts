import { Router } from 'express';
import { getProjects, getProject, createProject, getProgress, deleteProject, archiveProject } from './projects.controller.js';

const router = Router();

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id/progress', getProgress);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);
router.patch('/:id/archive', archiveProject);

export default router;
