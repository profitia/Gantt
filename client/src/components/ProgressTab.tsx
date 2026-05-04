import { useEffect, useState } from 'react';
import type { Project, ProjectProgress, TaskStatus } from '../types/task';
import type { Task } from '../types/task';
import { fetchProjectProgress } from '../api/tasks';

interface Props {
  projects: Project[];
  tasks: Task[];
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

function formatBudget(n: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);
}

function ProjectCard({ project }: { project: Project }) {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);

  useEffect(() => {
    fetchProjectProgress(project.id).then(setProgress).catch(() => null);
  }, [project.id]);

  const pct = progress?.avgProgress ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
        {project.description && (
          <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>
        )}
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {progress && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Tasks</p>
            <p className="font-semibold text-gray-900">
              {progress.completedTasks} / {progress.totalTasks}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Budget total</p>
            <p className="font-semibold text-gray-900">{formatBudget(progress.budgetTotal)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 col-span-2">
            <p className="text-xs text-green-600 mb-1">Budget completed</p>
            <p className="font-semibold text-green-700">{formatBudget(progress.budgetDone)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProgressTab({ projects, tasks }: Props) {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];

  const filteredTasks = tasks.filter((t) => {
    if (filterProject !== 'all' && t.projectId !== filterProject) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const filteredProjects =
    filterProject === 'all'
      ? projects
      : projects.filter((p) => p.id === filterProject);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Project cards */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No projects to display</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* Filtered task list */}
      {filteredTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">
              Tasks ({filteredTasks.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredTasks.map((t) => {
              const proj = projects.find((p) => p.id === t.projectId);
              return (
                <div key={t.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                    {proj && <p className="text-xs text-gray-400">{proj.name}</p>}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status as TaskStatus]}`}
                  >
                    {STATUS_LABELS[t.status as TaskStatus]}
                  </span>
                  <div className="w-24 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{t.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
