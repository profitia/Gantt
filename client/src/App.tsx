import { useEffect, useState, useCallback, useRef } from 'react';
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
  deleteProject,
  archiveProject,
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
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  // token that bumps to force ProgressTab to refetch progress data
  const [progressToken, setProgressToken] = useState(0);

  const autoSelectedRef = useRef(false);

  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
      if (data.length > 0 && !autoSelectedRef.current) {
        autoSelectedRef.current = true;
        setSelectedProjectId(data[0].id);
      }
    } catch {
      toast.error('Failed to load projects');
    }
  }, []);

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
      // optimistic update
      setTasks((prev) => [...prev, task]);
      setAllTasks((prev) => [...prev, task]);
      // also re-fetch to ensure consistency and bump progress
      if (payload.projectId) {
        await loadTasks(payload.projectId);
        await loadAllTasks();
        setProgressToken((n) => n + 1);
      }
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
      setProgressToken((n) => n + 1);
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
      setProgressToken((n) => n + 1);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      const remaining = projects.filter((p) => p.id !== id);
      setProjects(remaining);
      setTasks([]);
      setAllTasks((prev) => prev.filter((t) => t.projectId !== id));
      setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
      setProgressToken((n) => n + 1);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleArchiveProject = async (id: string) => {
    try {
      await archiveProject(id);
      const remaining = projects.filter((p) => p.id !== id);
      setProjects(remaining);
      setTasks([]);
      setAllTasks((prev) => prev.filter((t) => t.projectId !== id));
      setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
      setProgressToken((n) => n + 1);
      toast.success('Project archived');
    } catch {
      toast.error('Failed to archive project');
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
        {/* Main tabs */}
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
            {projects.length === 0 && !loading ? (
              <div className="text-center py-20 space-y-3">
                <p className="text-gray-500 font-medium">No projects yet</p>
                <p className="text-sm text-gray-400">Create your first project to get started</p>
                <ProjectSelector
                  projects={[]}
                  selectedId={null}
                  onSelect={() => {}}
                  onCreate={handleCreateProject}
                />
              </div>
            ) : (
              <>
                <ProjectSelector
                  projects={projects}
                  selectedId={selectedProjectId}
                  onSelect={(id) => setSelectedProjectId(id)}
                  onCreate={handleCreateProject}
                />

                {selectedProjectId && (
                  <>
                    <BudgetSummary tasks={tasks} />

                    <TaskForm
                      onSubmit={handleCreate}
                      projectId={selectedProjectId}
                    />

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

                    {/* Project actions */}
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleArchiveProject(selectedProjectId)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        Archive project
                      </button>
                      <button
                        onClick={() => handleDeleteProject(selectedProjectId)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        Delete project
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {mainTab === 'progress' && (
          <ProgressTab projects={projects} tasks={allTasks} refreshToken={progressToken} />
        )}
      </main>
    </div>
  );
}
