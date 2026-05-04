import prisma from '../prisma.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export async function getAllProjects() {
  return prisma.project.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id }, include: { tasks: true } });
}

export async function createProject(input: CreateProjectInput) {
  return prisma.project.create({
    data: {
      id: uuidv4(),
      name: input.name,
      description: input.description ?? '',
    },
  });
}

export async function getProjectProgress(id: string) {
  const tasks = await prisma.task.findMany({ where: { projectId: id } });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const avgProgress =
    totalTasks > 0
      ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
      : 0;
  const budgetTotal = tasks.reduce((sum, t) => sum + t.budget, 0);
  const budgetDone = tasks
    .filter((t) => t.status === 'done')
    .reduce((sum, t) => sum + t.budget, 0);

  return { totalTasks, completedTasks, avgProgress, budgetTotal, budgetDone };
}
