import { Request, Response } from 'express';
import * as tasksService from './tasks.service.ts';

const VALID_STATUSES = ['todo', 'in_progress', 'done', 'blocked'];

function isValidStatus(s: unknown): s is tasksService.TaskStatus {
  return typeof s === 'string' && VALID_STATUSES.includes(s);
}

function isValidDate(s: unknown): boolean {
  return typeof s === 'string' && !isNaN(Date.parse(s));
}

export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    const tasks = await tasksService.getAllTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const { name, startDate, endDate, budget, status, progress } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  if (!isValidDate(startDate)) {
    res.status(400).json({ error: 'startDate must be a valid date string' });
    return;
  }
  if (!isValidDate(endDate)) {
    res.status(400).json({ error: 'endDate must be a valid date string' });
    return;
  }
  if (typeof budget !== 'number' || budget < 0) {
    res.status(400).json({ error: 'budget must be a non-negative number' });
    return;
  }
  if (!isValidStatus(status)) {
    res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  try {
    const task = await tasksService.createTask({
      name: name.trim(),
      startDate,
      endDate,
      budget,
      status,
      progress: typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : 0,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const { name, startDate, endDate, budget, status, progress } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    res.status(400).json({ error: 'name must be a non-empty string' });
    return;
  }
  if (startDate !== undefined && !isValidDate(startDate)) {
    res.status(400).json({ error: 'startDate must be a valid date string' });
    return;
  }
  if (endDate !== undefined && !isValidDate(endDate)) {
    res.status(400).json({ error: 'endDate must be a valid date string' });
    return;
  }
  if (budget !== undefined && (typeof budget !== 'number' || budget < 0)) {
    res.status(400).json({ error: 'budget must be a non-negative number' });
    return;
  }
  if (status !== undefined && !isValidStatus(status)) {
    res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  try {
    const task = await tasksService.updateTask(id, {
      name: name?.trim(),
      startDate,
      endDate,
      budget,
      status,
      progress: typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : undefined,
    });
    res.json(task);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const id = String(req.params['id']);
  try {
    await tasksService.deleteTask(id);
    res.status(204).send();
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}
