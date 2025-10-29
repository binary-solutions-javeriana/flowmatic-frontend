'use client';
import { authApi } from '@/lib/authenticated-api';
import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  RefreshCw,
  ChevronDown,
  Check,
  X as XIcon,
  Clock,
  AlertTriangle
} from 'lucide-react';
import type { Task, TaskState, TaskPriority } from '@/lib/types/task-types';
import {
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus
} from '@/lib/hooks/use-tasks';
import {
  getTaskStateColor,
  getTaskPriorityColor
} from '@/lib/tasks/utils';
import TaskModal from './TaskModal';

type TaskApiPayload = Partial<Task> & {
  TaskID?: number;
  id?: number;
  Title?: string;
  Description?: string;
  State?: string;
  Priority?: string;
  LimitDate?: string;
  limitDate?: string;
  project_id?: number;
  ProjectID?: number;
  ProyectID?: number;
  assigned_to_ids?: number[] | string | null;
  assigned_to?: number[] | string | null;
  AssignedToIds?: number[] | string | null;
  AssignedToIDs?: number[] | string | null;
  updated_at?: string;
  UpdatedAt?: string;
  updatedAt?: string;
  CreatedBy?: number;
};

type NormalizedTask = Task & { updated_at?: string; AssignedToIDs?: number[] | string | null; assigned_to?: number[] | string | null; };
type TaskLikePayload = TaskApiPayload | NormalizedTask;

const normalizeTaskState = (value?: string): TaskState => {
  if (!value) return 'To Do';
  const normalized = value.toLowerCase();
  if (normalized === 'in progress') return 'In Progress';
  if (normalized === 'done') return 'Done';
  return 'To Do';
};

const normalizeTaskPriority = (value?: string): TaskPriority => {
  if (!value) return 'Medium';
  const normalized = value.toLowerCase();
  if (normalized === 'low') return 'Low';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'high') return 'High';
  if (normalized === 'critical') return 'Critical';
  return 'Medium';
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeAssignedIds = (value: Record<string, unknown>): number[] => {
  const raw = value['assigned_to_ids'] ?? value['AssignedToIDs'] ?? value['AssignedToIds'] ?? value['assigned_to'];

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'number') return item;
        const parsed = Number(item);
        return Number.isFinite(parsed) ? parsed : null;
      })
      .filter((item): item is number => item !== null);
  }

  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((item) => Number.isFinite(item));
  }

  return [];
};

// Normaliza cualquier payload de API al shape que espera el frontend
const normalizeTask = (input?: TaskLikePayload | null): NormalizedTask | null => {
  if (!input) {
    return null;
  }

  const record = input as Record<string, unknown>;

  const taskId = toNumber(record['task_id'] ?? record['TaskID'] ?? record['id']);
  const projectId = toNumber(record['proyect_id'] ?? record['project_id'] ?? record['ProjectID'] ?? record['ProyectID']);
  const createdBy = toNumber(record['created_by'] ?? record['CreatedBy']);
  const limitDate = record['limit_date'] ?? record['LimitDate'] ?? record['limitDate'];
  const updatedAt = record['updated_at'] ?? record['UpdatedAt'] ?? record['updatedAt'];

  const normalizedTask: NormalizedTask = {
    task_id: taskId ?? 0,
    proyect_id: projectId ?? 0,
    title: (record['title'] ?? record['Title'] ?? '').toString(),
    description: (record['description'] ?? record['Description'] ?? undefined) as string | undefined,
    state: normalizeTaskState(typeof record['state'] === 'string' ? record['state'] : typeof record['State'] === 'string' ? (record['State'] as string) : undefined),
    priority: normalizeTaskPriority(typeof record['priority'] === 'string' ? record['priority'] : typeof record['Priority'] === 'string' ? (record['Priority'] as string) : undefined),
    created_by: createdBy ?? 0,
    assigned_to_ids: normalizeAssignedIds(record),
  };

  const parentTaskId = toNumber(record['parent_task_id']);
  if (parentTaskId != null) {
    normalizedTask.parent_task_id = parentTaskId;
  }

  if (typeof limitDate === 'string' && limitDate.length > 0) {
    normalizedTask.limit_date = limitDate;
  }

  if (updatedAt) {
    normalizedTask.updated_at = updatedAt as string;
  }

  return normalizedTask;
};


interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (updatedTask?: Task) => void;
  onDelete: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [tempStatus, setTempStatus] = useState<TaskState>('To Do');
  const [tempPriority, setTempPriority] = useState<TaskPriority>('Medium');
  const [currentTask, setCurrentTask] = useState<NormalizedTask | null>(() => normalizeTask(task));
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');

  // Update currentTask when task prop changes
  React.useEffect(() => {
    setCurrentTask(normalizeTask(task));
  }, [task]);

  React.useEffect(() => {
    const fetchFresh = async () => {
      if (!isOpen || !task?.task_id) return;
      try {
        const freshRaw = await authApi.get<TaskApiPayload>(`/tasks/${task.task_id}`);
        const fresh = normalizeTask(freshRaw);
        if (fresh) {
          setCurrentTask((prev) => normalizeTask({ ...(prev ?? {}), ...fresh } as TaskLikePayload) ?? fresh);
        }
      } catch (e) {
        console.error('Failed to fetch fresh task', e);
      }
    };
    fetchFresh();
  }, [isOpen, task?.task_id]);

  const { updateTask, loading: updating } = useUpdateTask();
  const { deleteTask, loading: deleting } = useDeleteTask();
  const { updateTaskStatus, loading: updatingStatus } = useUpdateTaskStatus();

  const handleRefresh = async () => {
    if (!currentTask?.task_id) return;
    setIsRefreshing(true);
    try {
      const freshRaw = await authApi.get<TaskApiPayload>(`/tasks/${currentTask.task_id}`);
      const fresh = normalizeTask(freshRaw);
      if (fresh) {
        setCurrentTask((prev) => normalizeTask({ ...(prev ?? {}), ...fresh } as TaskLikePayload) ?? fresh);
        onUpdate(fresh); // si quieres refrescar la lista padre
      }
    } catch (error) {
      console.error('Error refreshing task data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };



  const handleUpdateTask = async (updatedTask: Task) => {
    setIsEditing(false);
    const merged = normalizeTask({ ...(currentTask ?? {}), ...updatedTask } as TaskLikePayload);
    if (merged) {
      setCurrentTask(merged);
      onUpdate(merged);
    }
    onClose();
  };
  const startEditingStatus = () => {
    if (currentTask) {
      setTempStatus(currentTask.state);
      setEditingStatus(true);
    }
  };

  const startEditingPriority = () => {
    if (currentTask) {
      setTempPriority(currentTask.priority);
      setEditingPriority(true);
    }
  };

  const saveStatus = async () => {
    if (!currentTask) return;

    try {
      const updatedTask = await updateTaskStatus(currentTask.task_id, tempStatus);
      if (updatedTask) {
        const merged = normalizeTask({ ...currentTask, ...updatedTask } as TaskLikePayload) ?? currentTask;
        setCurrentTask(merged);
        onUpdate(merged);
        setConfirmationMessage(`Status updated to "${tempStatus}" successfully!`);
      }
      setEditingStatus(false);
      onClose();
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert temp status on error
      setTempStatus(currentTask.state);
    }
  };

  const savePriority = async () => {
    if (!currentTask) return;

    try {
      const updatedTask = await updateTask(currentTask.task_id, {
        priority: tempPriority
      });
      if (updatedTask) {
        const merged = normalizeTask({ ...currentTask, ...updatedTask } as TaskLikePayload) ?? currentTask;
        setCurrentTask(merged);
        onUpdate(merged);
        setConfirmationMessage(`Priority updated to "${tempPriority}" successfully!`);
      }
      setEditingPriority(false);
      onClose();
    } catch (error) {
      console.error('Error updating task priority:', error);
      // Revert temp priority on error
      setTempPriority(currentTask.priority);
    }
  };

  const cancelStatus = () => {
    setEditingStatus(false);
  };

  const cancelPriority = () => {
    setEditingPriority(false);
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;

    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        const success = await deleteTask(currentTask.task_id);
        if (success) {
          onDelete();
          onClose();
        }
        // Error handling is done in the hook, no need to handle here
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  if (!isOpen || !currentTask) return null;

  const stateColors = getTaskStateColor(currentTask.state);
  const priorityColors = getTaskPriorityColor(currentTask.priority);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#9fdbc2]/20">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-[#0c272d]">{currentTask.title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh task data"
            >
              <RefreshCw className={`w-5 h-5 text-[#0c272d]/60 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDeleteTask}
              disabled={updating || deleting || updatingStatus}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              title="Delete task"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
            <button
              onClick={onClose}
              disabled={updating || deleting || updatingStatus}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-[#0c272d]/60" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Confirmation Message */}
          {confirmationMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
              {confirmationMessage}
            </div>
          )}

          {/* Task Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Status Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-48 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#0c272d] flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Status</span>
                </h3>
                {!editingStatus && (
                  <button
                    onClick={startEditingStatus}
                    disabled={updatingStatus}
                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    title="Edit status"
                  >
                    <Edit className="w-4 h-4 text-[#0c272d]/60" />
                  </button>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {editingStatus ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value as TaskState)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium appearance-none pr-8 ${getTaskStateColor(tempStatus)}`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-current opacity-60" />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={saveStatus}
                        disabled={updatingStatus}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 text-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelStatus}
                        disabled={updatingStatus}
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 text-sm"
                      >
                        <XIcon className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${stateColors}`}>
                      {currentTask.state}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-48 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#0c272d] flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Priority</span>
                </h3>
                {!editingPriority && (
                  <button
                    onClick={startEditingPriority}
                    disabled={updating}
                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    title="Edit priority"
                  >
                    <Edit className="w-4 h-4 text-[#0c272d]/60" />
                  </button>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {editingPriority ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={tempPriority}
                        onChange={(e) => setTempPriority(e.target.value as TaskPriority)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium appearance-none pr-8 ${getTaskPriorityColor(tempPriority)}`}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-current opacity-60" />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={savePriority}
                        disabled={updating}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 text-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelPriority}
                        disabled={updating}
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1 text-sm"
                      >
                        <XIcon className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium ${priorityColors}`}>
                      {currentTask.priority}
                    </div>
                    <p className="text-xs text-[#0c272d]/60 mt-2">
                      {currentTask.priority === 'Critical' && 'Requires immediate attention'}
                      {currentTask.priority === 'High' && 'High priority task'}
                      {currentTask.priority === 'Medium' && 'Standard priority task'}
                      {currentTask.priority === 'Low' && 'Low priority task'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Details Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#0c272d] mb-1">Need to edit more details?</h3>
                <p className="text-sm text-[#0c272d]/60">Update title, description, due date, or assignments</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                disabled={updating || deleting || updatingStatus}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Full Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <TaskModal
        key={`edit-${currentTask?.task_id}-${currentTask?.updated_at ?? ''}`}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleUpdateTask}
        mode="edit"
        task={currentTask}
      />
    </div>
  );
};

export default TaskDetailModal;
