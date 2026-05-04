import type { Task, TaskStatus } from '../types/task';

interface Props {
  tasks: Task[];
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#9ca3af',
  in_progress: '#3b82f6',
  done: '#22c55e',
  blocked: '#ef4444',
};

const STATUS_BG: Record<TaskStatus, string> = {
  todo: '#f3f4f6',
  in_progress: '#eff6ff',
  done: '#f0fdf4',
  blocked: '#fef2f2',
};

function formatBudget(n: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);
}

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function daysFromStart(projectStart: Date, taskStart: string) {
  const ms = new Date(taskStart).getTime() - projectStart.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
};

export default function GanttChart({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        Add tasks to see the Gantt chart.
      </div>
    );
  }

  const allDates = tasks.flatMap((t) => [new Date(t.startDate), new Date(t.endDate)]);
  const projectStart = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const projectEnd = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalDays = Math.max(1, daysBetween(projectStart.toISOString(), projectEnd.toISOString()) + 1);

  // Build column headers (weekly ticks)
  const headers: { label: string; dayOffset: number }[] = [];
  for (let i = 0; i <= totalDays; i += 7) {
    const d = new Date(projectStart);
    d.setDate(d.getDate() + i);
    headers.push({
      label: d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
      dayOffset: i,
    });
  }

  const today = new Date();
  const todayOffset = daysFromStart(projectStart, today.toISOString());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Gantt Chart</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {projectStart.toLocaleDateString('pl-PL')} - {projectEnd.toLocaleDateString('pl-PL')}
          &nbsp;({totalDays} days)
        </p>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${Math.max(700, totalDays * 12 + 220)}px` }}>
          {/* Header row */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-48 flex-shrink-0 px-4 py-2 text-xs font-medium text-gray-500 uppercase">Task</div>
            <div className="flex-1 relative h-8">
              {headers.map((h, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 text-xs text-gray-400"
                  style={{ left: `${(h.dayOffset / totalDays) * 100}%` }}
                >
                  {h.label}
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          {tasks.map((task) => {
            const offset = daysFromStart(projectStart, task.startDate);
            const duration = daysBetween(task.startDate, task.endDate);
            const leftPct = (offset / totalDays) * 100;
            const widthPct = Math.max(0.5, (duration / totalDays) * 100);

            return (
              <div key={task.id} className="flex items-center border-b border-gray-100 hover:bg-gray-50 group">
                <div className="w-48 flex-shrink-0 px-4 py-3">
                  <div className="text-sm font-medium text-gray-800 truncate">{task.name}</div>
                  <div className="text-xs text-gray-400">{STATUS_LABEL[task.status]}</div>
                </div>
                <div className="flex-1 relative h-10 py-2">
                  {/* Today line */}
                  {todayOffset >= 0 && todayOffset <= totalDays && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-orange-400 opacity-50 z-10"
                      style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                    />
                  )}
                  {/* Grid lines */}
                  {headers.map((h, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-gray-100"
                      style={{ left: `${(h.dayOffset / totalDays) * 100}%` }}
                    />
                  ))}
                  {/* Task bar */}
                  <div
                    className="absolute top-1 h-6 rounded-md flex items-center overflow-hidden shadow-sm"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      backgroundColor: STATUS_BG[task.status],
                      borderLeft: `3px solid ${STATUS_COLORS[task.status]}`,
                    }}
                    title={`${task.name} (${task.progress}%)`}
                  >
                    {/* Progress fill */}
                    <div
                      className="absolute top-0 left-0 h-full opacity-30 rounded-md"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: STATUS_COLORS[task.status],
                      }}
                    />
                    <span
                      className="relative z-10 text-xs font-medium px-2 truncate"
                      style={{ color: STATUS_COLORS[task.status] }}
                    >
                      {task.name}
                    </span>
                  </div>
                </div>
                <div className="w-20 flex-shrink-0 px-3 text-xs text-right text-gray-500 font-mono">
                  {formatBudget(task.budget)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
