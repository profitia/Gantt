import prisma from '../prisma.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export async function getAllProjects() {
  return prisma.project.findMany({
    where: { archived: false },
    orderBy: { createdAt: 'asc' },
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

export async function archiveProject(id: string) {
  return prisma.project.update({ where: { id }, data: { archived: true } });
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  const lateTasks = tasks.filter(
    (t) => t.status !== 'done' && new Date(t.endDate) < today
  ).length;
  const overBudget = budgetDone > budgetTotal;

  return { projectId: id, totalTasks, completedTasks, avgProgress, budgetTotal, budgetDone, lateTasks, overBudget };
}
