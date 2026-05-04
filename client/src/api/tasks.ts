import axios from 'axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://gantt-gj69.onrender.com'
    : 'http://localhost:3000');

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchTasks = (): Promise<Task[]> =>
  api.get<Task[]>('/tasks').then((r) => r.data);

export const createTask = (payload: CreateTaskPayload): Promise<Task> =>
  api.post<Task>('/tasks', payload).then((r) => r.data);

export const updateTask = (id: string, payload: UpdateTaskPayload): Promise<Task> =>
  api.put<Task>(`/tasks/${id}`, payload).then((r) => r.data);

export const deleteTask = (id: string): Promise<void> =>
  api.delete(`/tasks/${id}`).then(() => undefined);
