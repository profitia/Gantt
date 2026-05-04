import { useEffect, useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import GanttChart from './components/GanttChart';
import BudgetSummary from './components/BudgetSummary';
import { fetchTasks, createTask, updateTask, deleteTask } from './api/tasks';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from './types/task';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'gantt'>('list');

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async (payload: CreateTaskPayload) => {
    try {
      const task = await createTask(payload);
      setTasks((prev) => [...prev, task]);
      toast.success('Task added');
    } catch {
      toast.error('Failed to add task');
    }
  };

  const handleUpdate = async (id: string, payload: UpdateTaskPayload) => {
    try {
      const updated = await updateTask(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gantt Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Project task planning</p>
          </div>
          {loading && (
            <span className="text-xs text-blue-500 animate-pulse">Loading...</span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Budget summary */}
        <BudgetSummary tasks={tasks} />

        {/* Add task form */}
        <TaskForm onSubmit={handleCreate} />

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-lg p-1 w-fit">
          {(['list', 'gantt'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'list' ? 'Task List' : 'Gantt Chart'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'list' ? (
          <TaskList tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />
        ) : (
          <GanttChart tasks={tasks} />
        )}
      </main>
    </div>
  );
}
