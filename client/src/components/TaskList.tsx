import { useState } from 'react';
import type { Task, TaskStatus, UpdateTaskPayload } from '../types/task';
import StatusBadge from './StatusBadge';

interface Props {
  tasks: Task[];
  onUpdate: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatBudget(n: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);
}

function toInputDate(iso: string) {
  return iso.split('T')[0];
}

interface EditState {
  name: string;
  startDate: string;
  endDate: string;
  budget: string;
  status: TaskStatus;
  progress: string;
}

export default function TaskList({ tasks, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditState({
      name: task.name,
      startDate: toInputDate(task.startDate),
      endDate: toInputDate(task.endDate),
      budget: String(task.budget),
      status: task.status,
      progress: String(task.progress),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const saveEdit = async (id: string) => {
    if (!editState) return;
    setLoadingId(id);
    try {
      await onUpdate(id, {
        name: editState.name.trim(),
        startDate: editState.startDate,
        endDate: editState.endDate,
        budget: parseFloat(editState.budget) || 0,
        status: editState.status,
        progress: parseInt(editState.progress, 10) || 0,
      });
      setEditingId(null);
      setEditState(null);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    setLoadingId(id);
    try {
      await onDelete(id);
    } finally {
      setLoadingId(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        No tasks yet. Add one above.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Tasks ({tasks.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-right">Budget</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Progress</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) =>
              editingId === task.id && editState ? (
                <tr key={task.id} className="bg-blue-50">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editState.name}
                      onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 space-y-1">
                    <input
                      type="date"
                      value={editState.startDate}
                      onChange={(e) => setEditState({ ...editState, startDate: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    />
                    <input
                      type="date"
                      value={editState.endDate}
                      onChange={(e) => setEditState({ ...editState, endDate: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={editState.budget}
                      onChange={(e) => setEditState({ ...editState, budget: e.target.value })}
                      min="0"
                      step="0.01"
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-right"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={editState.status}
                      onChange={(e) => setEditState({ ...editState, status: e.target.value as TaskStatus })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="range"
                      value={editState.progress}
                      onChange={(e) => setEditState({ ...editState, progress: e.target.value })}
                      min="0"
                      max="100"
                      step="5"
                      className="w-full accent-blue-500"
                    />
                    <span className="text-xs text-gray-500 block text-center">{editState.progress}%</span>
                  </td>
                  <td className="px-4 py-2 text-center space-x-1">
                    <button
                      onClick={() => saveEdit(task.id)}
                      disabled={loadingId === task.id}
                      className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      {loadingId === task.id ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{task.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <div>{formatDate(task.startDate)}</div>
                    <div className="text-gray-400">→ {formatDate(task.endDate)}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{formatBudget(task.budget)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center space-x-1">
                    <button
                      onClick={() => startEdit(task)}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      disabled={loadingId === task.id}
                      className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    >
                      {loadingId === task.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
