import type { Task, TaskStatus } from '../types/task';

interface Props {
  tasks: Task[];
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'text-gray-600 bg-gray-50 border-gray-200',
  in_progress: 'text-blue-600 bg-blue-50 border-blue-200',
  done: 'text-green-600 bg-green-50 border-green-200',
  blocked: 'text-red-600 bg-red-50 border-red-200',
};

function formatBudget(n: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);
}

export default function BudgetSummary({ tasks }: Props) {
  const total = tasks.reduce((sum, t) => sum + t.budget, 0);

  const byStatus = (['todo', 'in_progress', 'done', 'blocked'] as TaskStatus[]).map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
    budget: tasks.filter((t) => t.status === status).reduce((sum, t) => sum + t.budget, 0),
  }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* Total */}
      <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Total Budget</div>
        <div className="text-xl font-bold text-gray-900">{formatBudget(total)}</div>
        <div className="text-xs text-gray-400 mt-1">{tasks.length} tasks</div>
      </div>

      {/* Per status */}
      {byStatus.map(({ status, count, budget }) => (
        <div
          key={status}
          className={`bg-white rounded-xl shadow-sm border p-4 ${STATUS_COLORS[status].split(' ').slice(1).join(' ')}`}
        >
          <div className={`text-xs font-medium uppercase mb-1 ${STATUS_COLORS[status].split(' ')[0]}`}>
            {STATUS_LABELS[status]}
          </div>
          <div className={`text-lg font-bold ${STATUS_COLORS[status].split(' ')[0]}`}>
            {formatBudget(budget)}
          </div>
          <div className="text-xs text-gray-400 mt-1">{count} task{count !== 1 ? 's' : ''}</div>
        </div>
      ))}
    </div>
  );
}
