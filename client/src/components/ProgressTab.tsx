import { useEffect, useState } from 'react';
import type { Project, ProjectProgress, TaskStatus } from '../types/task';
import type { Task } from '../types/task';
import { fetchProjectProgress } from '../api/tasks';
import TimelineView from './TimelineView';

type ViewMode = 'cards' | 'timeline';
type SortField = 'startDate' | 'endDate' | 'budget' | 'status' | 'progress';
type SortDirection = 'asc' | 'desc' | null;

function renderNotes(text: string | null | undefined) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i} className="whitespace-pre-wrap">{part}</span>
        )
      )}
    </>
  );
}

interface Props {
  projects: Project[];
  tasks: Task[];
  refreshToken?: number;
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
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);
}

function ProjectCard({ project, refreshToken }: { project: Project; refreshToken?: number }) {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);

  useEffect(() => {
    fetchProjectProgress(project.id).then(setProgress).catch(() => null);
  }, [project.id, refreshToken]);

  const pct = progress?.avgProgress ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
          {project.description && (
            <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>
          )}
        </div>
        {/* Badges */}
        <div className="flex flex-col gap-1 items-end shrink-0">
          {progress?.overBudget && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium whitespace-nowrap">
              Over budget
            </span>
          )}
          {progress && progress.lateTasks > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap">
              Delayed ({progress.lateTasks})
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      {progress ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Tasks done</p>
            <p className="font-semibold text-gray-900">
              {progress.completedTasks} / {progress.totalTasks}
            </p>
          </div>
          <div className={`rounded-lg p-3 ${progress.overBudget ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className={`text-xs mb-1 ${progress.overBudget ? 'text-red-500' : 'text-gray-400'}`}>Budget done / total</p>
            <p className={`font-semibold text-sm ${progress.overBudget ? 'text-red-700' : 'text-gray-900'}`}>
              {formatBudget(progress.budgetDone)} / {formatBudget(progress.budgetTotal)}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center">
          <span className="text-xs text-gray-300 animate-pulse">Loading...</span>
        </div>
      )}
    </div>
  );
}

export default function ProgressTab({ projects, tasks, refreshToken }: Props) {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortField(null);
      setSortDirection(null);
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="text-gray-300">↕</span>;
    if (sortDirection === 'asc') return <span className="text-blue-500">↑</span>;
    return <span className="text-blue-500">↓</span>;
  };

  const statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];

  const filteredTasks = tasks.filter((t) => {
    if (filterProject !== 'all' && t.projectId !== filterProject) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let valA = 0;
    let valB = 0;
    switch (sortField) {
      case 'startDate':
        valA = new Date(a.startDate).getTime();
        valB = new Date(b.startDate).getTime();
        break;
      case 'endDate':
        valA = new Date(a.endDate).getTime();
        valB = new Date(b.endDate).getTime();
        break;
      case 'budget':
        valA = a.budget;
        valB = b.budget;
        break;
      case 'progress':
        valA = a.progress;
        valB = b.progress;
        break;
      case 'status': {
        const order: Record<TaskStatus, number> = { blocked: 0, todo: 1, in_progress: 2, done: 3 };
        valA = order[a.status];
        valB = order[b.status];
        break;
      }
    }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredProjects =
    filterProject === 'all'
      ? projects
      : projects.filter((p) => p.id === filterProject);

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 shadow-sm p-3 w-fit">
        <button
          onClick={() => setViewMode('cards')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'cards'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Cards
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'timeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Timeline
        </button>
      </div>

      {viewMode === 'timeline' ? (
        <TimelineView tasks={tasks} projects={projects} />
      ) : (
        <>
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
            <ProjectCard key={p.id} project={p} refreshToken={refreshToken} />
          ))}
        </div>
      )}

      {/* Filtered task list */}
      {filteredTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-700">
              Tasks ({filteredTasks.length})
            </h3>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-400 mr-0.5">Sort:</span>
              {([
                ['startDate', 'Start'],
                ['endDate', 'End'],
                ['budget', 'Budget'],
                ['status', 'Status'],
                ['progress', 'Progress'],
              ] as [SortField, string][]).map(([field, label]) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded transition-colors ${
                    sortField === field
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {label} {renderSortIcon(field)}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {sortedFilteredTasks.map((t) => {
              const proj = projects.find((p) => p.id === t.projectId);
              return (
                <div key={t.id} className="px-5 py-3 flex flex-col">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {t.notes && (
                          <button
                            onClick={() => setExpandedNoteId(expandedNoteId === t.id ? null : t.id)}
                            className="text-gray-400 hover:text-gray-600 text-xs leading-none shrink-0"
                            title={expandedNoteId === t.id ? 'Hide notes' : 'Show notes'}
                          >
                            {expandedNoteId === t.id ? '▼' : '▶'}
                          </button>
                        )}
                        <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                      </div>
                      {proj && <p className="text-xs text-gray-400 pl-4">{proj.name}</p>}
                      {t.notes && expandedNoteId !== t.id && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate pl-4">
                          {t.notes.slice(0, 60)}{t.notes.length > 60 ? '…' : ''}
                        </p>
                      )}
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
                  {expandedNoteId === t.id && t.notes && (
                    <div className="mt-2 ml-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700 leading-relaxed">
                      {renderNotes(t.notes)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

