import { Request, Response } from 'express';
import * as projectsService from './projects.service.js';

export async function getProjects(_req: Request, res: Response): Promise<void> {
  try {
    const projects = await projectsService.getAllProjects();
    res.json(projects);
  } catch (err) {
    console.error('[getProjects]', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

export async function getProject(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  try {
    const project = await projectsService.getProjectById(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (err) {
    console.error('[getProject]', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

export async function createProject(req: Request, res: Response): Promise<void> {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  try {
    const project = await projectsService.createProject({
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : '',
    });
    res.status(201).json(project);
  } catch (err) {
    console.error('[createProject]', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function getProgress(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  try {
    const progress = await projectsService.getProjectProgress(id);
    res.json(progress);
  } catch (err) {
    console.error('[getProgress]', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
}
