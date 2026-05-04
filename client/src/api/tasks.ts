import axios from 'axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload, Project, CreateProjectPayload, ProjectProgress } from '../types/task';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://gantt-gj69.onrender.com'
    : 'http://localhost:3000');

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- Tasks ---
export const fetchTasks = (projectId?: string): Promise<Task[]> =>
  api.get<Task[]>('/tasks', { params: projectId ? { projectId } : undefined }).then((r) => r.data);

export const createTask = (payload: CreateTaskPayload): Promise<Task> =>
  api.post<Task>('/tasks', payload).then((r) => r.data);

export const updateTask = (id: string, payload: UpdateTaskPayload): Promise<Task> =>
  api.put<Task>(`/tasks/${id}`, payload).then((r) => r.data);

export const deleteTask = (id: string): Promise<void> =>
  api.delete(`/tasks/${id}`).then(() => undefined);

// --- Projects ---
export const fetchProjects = (): Promise<Project[]> =>
  api.get<Project[]>('/projects').then((r) => r.data);

export const createProject = (payload: CreateProjectPayload): Promise<Project> =>
  api.post<Project>('/projects', payload).then((r) => r.data);

export const fetchProjectProgress = (id: string): Promise<ProjectProgress> =>
  api.get<ProjectProgress>(`/projects/${id}/progress`).then((r) => r.data);
