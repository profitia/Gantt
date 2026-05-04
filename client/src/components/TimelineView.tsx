import { useState, useMemo } from 'react';
import type { Task, Project, TaskStatus } from '../types/task';

interface Props {
  tasks: Task[];
  projects: Project[];
}

type Horizon = 7 | 14 | 30 | 'max';

const STATUS_COLORS: Record<TaskStatus, { bar: string; label: string }> = {
  todo: { bar: 'bg-gray-400', label: 'To Do' },
  in_progress: { bar: 'bg-blue-500', label: 'In Progress' },
  done: { bar: 'bg-green-500', label: 'Done' },
  blocked: { bar: 'bg-red-500', label: 'Blocked' },
};

const STATUS_ORDER: Record<TaskStatus, number> = {
  in_progress: 0,
  blocked: 1,
  todo: 2,
  done: 3,
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

// Minimum px per day before horizontal scroll kicks in
const MIN_DAY_WIDTH = 36;

export default function TimelineView({ tasks, projects }: Props) {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [horizon, setHorizon] = useState<Horizon>('max');

  const statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];

  const horizonOptions: { value: Horizon; label: string }[] = [
    { value: 7, label: '7d' },
    { value: 14, label: '14d' },
    { value: 30, label: '30d' },
    { value: 'max', label: 'Max' },
  ];

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filterProject !== 'all' && t.projectId !== filterProject) return false;
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        const orderDiff = STATUS_ORDER[a.status as TaskStatus] - STATUS_ORDER[b.status as TaskStatus];
        if (orderDiff !== 0) return orderDiff;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  }, [tasks, filterProject, filterStatus]);

  const allTasksMinMax = useMemo(() => {
    if (filteredTasks.length === 0) {
      const t = startOfDay(new Date());
      return { minDate: t, maxDate: addDays(t, 30) };
    }
    const starts = filteredTasks.map((t) => startOfDay(new Date(t.startDate)));
    const ends = filteredTasks.map((t) => startOfDay(new Date(t.endDate)));
    return {
      minDate: new Date(Math.min(...starts.map((d) => d.getTime()))),
      maxDate: new Date(Math.max(...ends.map((d) => d.getTime()))),
    };
  }, [filteredTasks]);

  // visibleStart = earliest task start; visibleEnd = start + horizonDays
  const { visibleStart, visibleEnd, totalDays } = useMemo(() => {
    const start = allTasksMinMax.minDate;
    if (horizon === 'max') {
      const end = allTasksMinMax.maxDate;
      const days = Math.max(daysBetween(start, end) + 1, 1);
      return { visibleStart: start, visibleEnd: end, totalDays: days };
    }
    const horizonDays = horizon as number;
    const end = addDays(start, horizonDays - 1);
    return { visibleStart: start, visibleEnd: end, totalDays: horizonDays };
  }, [allTasksMinMax, horizon]);

  const days = useMemo(
    () => Array.from({ length: totalDays }, (_, i) => addDays(visibleStart, i)),
    [visibleStart, totalDays]
  );

  const today = startOfDay(new Date());
  const todayOffsetDays = daysBetween(visibleStart, today);
  const showTodayLine = todayOffsetDays >= 0 && todayOffsetDays < totalDays;
  const todayLeftPct = ((todayOffsetDays + 0.5) / totalDays) * 100;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <span className="text-sm font-medium text-gray-600">Project:</span>
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

        <span className="text-sm font-medium text-gray-600">Status:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{STATUS_COLORS[s].label}</option>
          ))}
        </select>

        <span className="text-sm font-medium text-gray-600 ml-2">Horizon:</span>
        <div className="flex gap-1">
          {horizonOptions.map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setHorizon(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                horizon === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No tasks to display</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex">
            {/* Sticky sidebar */}
            <div
              className="shrink-0 bg-white border-r border-gray-200"
              style={{ width: '192px', zIndex: 10 }}
            >
              {/* Header spacer */}
              <div className="h-10 border-b border-gray-200 bg-gray-50 flex items-center px-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</span>
              </div>
              {/* Task name rows */}
              {filteredTasks.map((t) => {
                const proj = projects.find((p) => p.id === t.projectId);
                const color = STATUS_COLORS[t.status as TaskStatus];
                return (
                  <div
                    key={t.id}
                    className="h-14 flex flex-col justify-center px-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`shrink-0 w-2 h-2 rounded-full ${color.bar}`} />
                      <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                    </div>
                    {proj && <p className="text-xs text-gray-400 truncate pl-3.5">{proj.name}</p>}
                  </div>
                );
              })}
            </div>

            {/* Scrollable chart */}
            <div className="overflow-x-auto flex-1">
              {/* Inner div: min-width forces scroll when days are too narrow */}
              <div style={{ minWidth: `${totalDays * MIN_DAY_WIDTH}px`, width: '100%', position: 'relative' }}>

                {/* Day header */}
                <div className="flex h-10 border-b border-gray-200 bg-gray-50">
                  {days.map((day, i) => {
                    const isToday =
                      day.getFullYear() === today.getFullYear() &&
                      day.getMonth() === today.getMonth() &&
                      day.getDate() === today.getDate();
                    return (
                      <div
                        key={i}
                        className={`h-full flex items-center justify-center border-r border-gray-200 text-xs font-medium ${
                          isToday ? 'text-blue-600 bg-blue-50' : 'text-gray-500'
                        }`}
                        style={{ width: `${100 / totalDays}%` }}
                      >
                        {formatDayLabel(day)}
                      </div>
                    );
                  })}
                </div>

                {/* Task rows */}
                {filteredTasks.map((t) => {
                  const taskStart = startOfDay(new Date(t.startDate));
                  const taskEnd = startOfDay(new Date(t.endDate));

                  // Clamp to visible range
                  const clampedStart = taskStart < visibleStart ? visibleStart : taskStart;
                  const clampedEnd = taskEnd > visibleEnd ? visibleEnd : taskEnd;

                  // Skip if entirely outside visible range
                  if (clampedEnd < visibleStart || clampedStart > visibleEnd) return null;

                  const offsetDays = daysBetween(visibleStart, clampedStart);
                  const durationDays = Math.max(daysBetween(clampedStart, clampedEnd) + 1, 1);

                  const leftPct = (offsetDays / totalDays) * 100;
                  const widthPct = (durationDays / totalDays) * 100;

                  const color = STATUS_COLORS[t.status as TaskStatus];

                  return (
                    <div
                      key={t.id}
                      className="relative h-14 border-b border-gray-100 last:border-b-0"
                    >
                      {/* Vertical grid lines */}
                      {days.map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-r border-gray-100"
                          style={{ left: `${((i + 1) / totalDays) * 100}%` }}
                        />
                      ))}

                      {/* Today line */}
                      {showTodayLine && (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-blue-400 opacity-60 z-10"
                          style={{ left: `${todayLeftPct}%` }}
                        />
                      )}

                      {/* Task bar */}
                      <div
                        title={`${t.name} | ${color.label} | ${t.progress}%`}
                        className={`absolute top-3 h-8 rounded-md ${color.bar} opacity-90 hover:opacity-100 transition-opacity cursor-default overflow-hidden`}
                        style={{ left: `calc(${leftPct}% + 2px)`, width: `calc(${widthPct}% - 4px)` }}
                      >
                        {/* Progress fill overlay */}
                        {t.progress > 0 && (
                          <div
                            className="absolute inset-0 bg-black rounded-md"
                            style={{ width: `${t.progress}%`, opacity: 0.15 }}
                          />
                        )}
                        <div className="relative h-full flex items-center px-2">
                          <span className="text-xs text-white font-semibold truncate select-none drop-shadow-sm">
                            {t.name}
                            {t.progress > 0 && ` · ${t.progress}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-5 px-1">
        {(Object.entries(STATUS_COLORS) as [TaskStatus, { bar: string; label: string }][]).map(
          ([status, { bar, label }]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${bar}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          )
        )}
        {showTodayLine && (
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 bg-blue-400" />
            <span className="text-xs text-gray-500">Today</span>
          </div>
        )}
      </div>
    </div>
  );
}
