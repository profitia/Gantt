import { useEffect, useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import GanttChart from './components/GanttChart';
import BudgetSummary from './components/BudgetSummary';
import ProjectSelector from './components/ProjectSelector';
import ProgressTab from './components/ProgressTab';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchProjects,
  createProject,
} from './api/tasks';
import type { Task, Project, CreateTaskPayload, UpdateTaskPayload, CreateProjectPayload } from './types/task';

type MainTab = 'projects' | 'progress';
type ProjectTab = 'list' | 'gantt';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<MainTab>('projects');
  const [projectTab, setProjectTab] = useState<ProjectTab>('list');

  // All tasks (for progress tab)
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch {
      toast.error('Failed to load projects');
    }
  }, [selectedProjectId]);

  const loadTasks = useCallback(async (projectId: string) => {
    try {
      const data = await fetchTasks(projectId);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    }
  }, []);

  const loadAllTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setAllTasks(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadProjects().finally(() => setLoading(false));
    loadAllTasks();
  }, [loadProjects, loadAllTasks]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  }, [selectedProjectId, loadTasks]);

  // Reload all tasks when switching to progress tab
  useEffect(() => {
    if (mainTab === 'progress') {
      loadAllTasks();
    }
  }, [mainTab, loadAllTasks]);

  const handleCreateProject = async (payload: CreateProjectPayload) => {
    const project = await createProject(payload);
    setProjects((prev) => [...prev, project]);
    setSelectedProjectId(project.id);
    toast.success('Project created');
  };

  const handleCreate = async (payload: CreateTaskPayload) => {
    try {
      const task = await createTask(payload);
      setTasks((prev) => [...prev, task]);
      setAllTasks((prev) => [...prev, task]);
      toast.success('Task added');
    } catch {
      toast.error('Failed to add task');
    }
  };

  const handleUpdate = async (id: string, payload: UpdateTaskPayload) => {
    try {
      const updated = await updateTask(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
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
        {/* Main tabs: Projects / Progress */}
        <div className="flex gap-1 bg-gray-200 rounded-lg p-1 w-fit">
          {(['projects', 'progress'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mainTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'projects' ? 'Projects' : 'Progress'}
            </button>
          ))}
        </div>

        {mainTab === 'projects' && (
          <>
            {/* Project selector */}
            <ProjectSelector
              projects={projects}
              selectedId={selectedProjectId}
              onSelect={(id) => setSelectedProjectId(id)}
              onCreate={handleCreateProject}
            />

            {selectedProjectId ? (
              <>
                {/* Budget summary for current project */}
                <BudgetSummary tasks={tasks} />

                {/* Add task form */}
                <TaskForm
                  onSubmit={handleCreate}
                  projectId={selectedProjectId}
                />

                {/* Project sub-tabs: List / Gantt */}
                <div className="flex gap-1 bg-gray-200 rounded-lg p-1 w-fit">
                  {(['list', 'gantt'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setProjectTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        projectTab === tab
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab === 'list' ? 'Task List' : 'Gantt Chart'}
                    </button>
                  ))}
                </div>

                {projectTab === 'list' ? (
                  <TaskList tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />
                ) : (
                  <GanttChart tasks={tasks} />
                )}
              </>
            ) : (
              !loading && (
                <div className="text-center py-16 text-gray-400 text-sm">
                  Create a project to get started
                </div>
              )
            )}
          </>
        )}

        {mainTab === 'progress' && (
          <ProgressTab projects={projects} tasks={allTasks} />
        )}
      </main>
    </div>
  );
}
