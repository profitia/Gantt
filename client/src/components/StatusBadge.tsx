import type { TaskStatus } from '../types/task';

const STATUS_CONFIG: Record<TaskStatus, { label: string; classes: string }> = {
  todo: { label: 'To Do', classes: 'bg-gray-100 text-gray-700 border border-gray-300' },
  in_progress: { label: 'In Progress', classes: 'bg-blue-100 text-blue-700 border border-blue-300' },
  done: { label: 'Done', classes: 'bg-green-100 text-green-700 border border-green-300' },
  blocked: { label: 'Blocked', classes: 'bg-red-100 text-red-700 border border-red-300' },
};

interface Props {
  status: TaskStatus;
}

export default function StatusBadge({ status }: Props) {
  const { label, classes } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
