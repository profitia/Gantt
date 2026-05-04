import prisma from '../prisma.ts';
import { v4 as uuidv4 } from 'uuid';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface CreateTaskInput {
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TaskStatus;
  progress: number;
}

export interface UpdateTaskInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: TaskStatus;
  progress?: number;
}

export async function getAllTasks() {
  return prisma.task.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function createTask(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      id: uuidv4(),
      name: input.name,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      budget: input.budget,
      status: input.status,
      progress: input.progress ?? 0,
    },
  });
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  return prisma.task.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.startDate !== undefined && { startDate: new Date(input.startDate) }),
      ...(input.endDate !== undefined && { endDate: new Date(input.endDate) }),
      ...(input.budget !== undefined && { budget: input.budget }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.progress !== undefined && { progress: input.progress }),
    },
  });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}
