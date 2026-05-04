export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TaskStatus;
  progress: number;
  createdAt: string;
}

export interface CreateTaskPayload {
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TaskStatus;
  progress: number;
}

export interface UpdateTaskPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: TaskStatus;
  progress?: number;
}
