export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TaskStatus;
  progress: number;
  notes?: string | null;
  createdAt: string;
  projectId: string;
}

export interface CreateTaskPayload {
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TaskStatus;
  progress: number;
  projectId: string;
  notes?: string;
}

export interface UpdateTaskPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: TaskStatus;
  progress?: number;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  archived: boolean;
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface ProjectProgress {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  avgProgress: number;
  budgetTotal: number;
  budgetDone: number;
  lateTasks: number;
  overBudget: boolean;
}

