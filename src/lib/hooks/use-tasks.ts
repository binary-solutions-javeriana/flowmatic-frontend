"use client";

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../authenticated-api';
import type {
  Task,
  TaskFilters,
  TasksResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  KanbanBoard,
  TimeEntry,
  CreateTimeEntryRequest,
  TimeEntriesResponse,
  AssignUsersRequest,
  AssignUsersResponse,
  SubtasksResponse,
  TaskPriority
} from '../types/task-types';
import { ApiException } from '../api';

// Pagination type
interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

type TaskListResponse = Task[] | {
  data?: Task[];
  tasks?: Task[];
  meta?: TaskPagination;
};

interface TaskAssigneeRecord {
  UserID?: number | string;
  user_id?: number | string;
  id?: number | string;
}

type TaskAssigneesApiResponse =
  | TaskAssigneeRecord[]
  | number[]
  | {
      data?: TaskAssigneeRecord[] | number[];
    };

const isApiException = (error: unknown): error is ApiException => error instanceof ApiException;

const toTitleCasePriority = (priority?: TaskPriority | string): TaskPriority | undefined => {
  if (!priority) {
    return undefined;
  }

  const normalized = priority.toString().toLowerCase();

  switch (normalized) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    default:
      return undefined;
  }
};

const normalizeAssignedUserIdsInput = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'number') {
          return item;
        }

        if (typeof item === 'string') {
          const parsed = Number(item.trim());
          return Number.isFinite(parsed) ? parsed : NaN;
        }

        return NaN;
      })
      .filter((item): item is number => Number.isFinite(item));
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((item) => Number.isFinite(item));
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return [value];
  }

  return [];
};

const normalizeTaskListResponse = (
  response: TaskListResponse
): { tasks: Task[]; pagination: TaskPagination | null } => {
  if (Array.isArray(response)) {
    return { tasks: response, pagination: null };
  }

  if (response.data && Array.isArray(response.data)) {
    return { tasks: response.data, pagination: response.meta ?? null };
  }

  if (response.tasks && Array.isArray(response.tasks)) {
    return { tasks: response.tasks, pagination: response.meta ?? null };
  }

  return { tasks: [], pagination: null };
};

const extractProjectId = (input: unknown): number | undefined => {
  if (typeof input !== 'object' || input === null) {
    return undefined;
  }

  const record = input as Record<string, unknown>;
  const candidates = [record['proyect_id'], record['project_id']];

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }

    if (typeof candidate === 'string') {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const extractAssigneeIds = (response: TaskAssigneesApiResponse): number[] => {
  const records = Array.isArray(response) ? response : response.data ?? [];

  return records
    .map((entry) => {
      if (typeof entry === 'number') {
        return Number.isFinite(entry) ? entry : undefined;
      }

      const candidate = entry.UserID ?? entry.user_id ?? entry.id;

      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate;
      }

      if (typeof candidate === 'string') {
        const parsed = Number(candidate);
        return Number.isFinite(parsed) ? parsed : undefined;
      }

      return undefined;
    })
    .filter((value): value is number => value !== undefined);
};

const getStatusCode = (error: unknown): number | undefined =>
  isApiException(error) ? error.statusCode : undefined;

// Hook to fetch all tasks with filters
export function useTasks(initialFilters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<TaskPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    // Permitir desactivar las llamadas de tareas para evitar 404s mientras se define el backend
    const disableTasks = (process.env.NEXT_PUBLIC_DISABLE_TASKS ?? 'false') === 'true';
    if (disableTasks) {
      setTasks([]);
      setPagination(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Build query string from filters with defaults
      const params = new URLSearchParams();

      // Always send page and limit
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 10;

      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filters?.search) params.append('search', filters.search);
      if (filters?.state) params.append('state', filters.state);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
      if (filters?.project_id) params.append('project_id', filters.project_id.toString());

      const queryString = params.toString();
      const url = `/tasks?${queryString}`;

      console.log('[useTasks] Fetching tasks with URL:', url);
      console.log('[useTasks] Filters:', filters);

      const response = await authApi.get<TasksResponse>(url);

      console.log('[useTasks] Response received:', response);
      console.log('[useTasks] Response data:', response?.data);
      console.log('[useTasks] Response meta:', response?.meta);
      console.log('[useTasks] Number of tasks:', response?.data?.length || 0);

      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format: response is not an object');
      }

      if (!response.data || !Array.isArray(response.data)) {
        console.error('[useTasks] Invalid data structure. Expected { data: [], meta: {} }, got:', response);
        throw new Error(`Invalid response format: data is ${response.data ? 'not an array' : 'missing'}`);
      }

      setTasks(response.data);
      setPagination(response.meta || null);

      console.log('[useTasks] Tasks state updated with', response.data.length, 'tasks');
    } catch (err) {
      const status = getStatusCode(err);
      const message = err instanceof Error ? err.message : '';
      if (status === 404 || message.includes('404') || message.includes('Cannot GET')) {
        console.warn('[useTasks] Tasks endpoint not available. Treating as empty list.');
        setTasks([]);
        setPagination(null);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
        setError(errorMessage);
        console.error('[useTasks] Error fetching tasks:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tasks,
    pagination,
    loading,
    error,
    fetchTasks,
    refetch: () => fetchTasks(initialFilters)
  };
}

// Hook to fetch tasks for a specific project
export function useProjectTasks(projectId?: number | null, filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<TaskPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectTasks = useCallback(async () => {
    if (projectId == null) return;

    setLoading(true);
    setError(null);

    try {
      // Use the correct endpoint for project tasks
      const params = new URLSearchParams();

      const pageFilter = filters?.page ?? 1;
      const limitFilter = filters?.limit ?? 10;
      const searchFilter = filters?.search;
      const stateFilter = filters?.state;
      const priorityFilter = filters?.priority;
      const assignedToFilter = filters?.assigned_to;

      const page = pageFilter ?? 1;
      const limit = limitFilter ?? 10;

      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (searchFilter) params.append('search', searchFilter);
      if (stateFilter) params.append('state', stateFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (assignedToFilter) params.append('assigned_to', assignedToFilter);

      const queryString = params.toString();
      const url = `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;

      console.log('[useProjectTasks] Fetching project tasks with URL:', url);

      const response = await authApi.get<TaskListResponse>(url);

      console.log('[useProjectTasks] Response received:', response);
      console.log('[useProjectTasks] Response type:', typeof response);
      console.log('[useProjectTasks] Is array?', Array.isArray(response));

      const { tasks: normalizedTasks, pagination: normalizedPagination } = normalizeTaskListResponse(response);

      setTasks(normalizedTasks);
      setPagination(normalizedPagination);

      console.log('[useProjectTasks] Tasks state updated with', normalizedTasks.length, 'tasks');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project tasks';
      setError(errorMessage);
      console.error('[useProjectTasks] Error fetching project tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters]);

  useEffect(() => {
    fetchProjectTasks();
  }, [fetchProjectTasks]);

  return {
    tasks,
    pagination,
    loading,
    error,
    refetch: fetchProjectTasks
  };
}

// Hook to fetch a single task
export function useTask(taskId: number) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.get<Task>(`/tasks/${taskId}`);
      setTask(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch task';
      setError(errorMessage);
      console.error('Error fetching task:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    loading,
    error,
    refetch: fetchTask
  };
}

// Hook to create a task
export function useCreateTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (data: CreateTaskRequest): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const projectId = extractProjectId(data);
      const title = data.title?.trim();
      const state = data.state ?? 'To Do';
      const priority = toTitleCasePriority(data.priority) ?? 'Medium';
      const assignedUserIds = normalizeAssignedUserIdsInput(data.assigned_to_ids);

      if (projectId === undefined) {
        throw new Error('ProjectID is required');
      }

      if (!title) {
        throw new Error('Title is required');
      }

      if (!state) {
        throw new Error('State is required');
      }

      if (typeof data.created_by !== 'number' || Number.isNaN(data.created_by)) {
        throw new Error('CreatedBy is required');
      }

      const payload: Record<string, unknown> = {
        ProjectID: projectId,
        Title: title,
        Description: data.description?.trim(),
        Priority: priority,
        State: state,
        CreatedBy: data.created_by,
        LimitDate: data.limit_date ?? undefined,
      };

      if (assignedUserIds.length > 0) {
        payload.AssignedToIDs = assignedUserIds;
      }

      const endpoint = projectId ? `/projects/${projectId}/tasks` : '/tasks';
      const response = await authApi.post<Task>(endpoint, payload);

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      setError(errorMessage);
      console.error('Error creating task:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTask,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to update a task
export function useUpdateTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTask = async (taskId: number, data: UpdateTaskRequest): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {};

      if (data.title !== undefined) {
        payload.Title = data.title?.trim();
      }

      if (data.description !== undefined) {
        payload.Description = data.description?.trim();
      }

      if (data.state !== undefined) {
        payload.State = data.state;
      }

      const normalizedPriority = toTitleCasePriority(data.priority);
      if (normalizedPriority) {
        payload.Priority = normalizedPriority;
      }

      if (data.limit_date !== undefined) {
        payload.LimitDate = data.limit_date;
      }

      const response = await authApi.patch<Task>(`/tasks/${taskId}`, payload);

      if (data.assigned_to_ids !== undefined) {
        const nextIds = normalizeAssignedUserIdsInput(data.assigned_to_ids);

        try {
          const currentResponse = await authApi.get<TaskAssigneesApiResponse>(`/tasks/${taskId}/assignees`);
          const currentIds = extractAssigneeIds(currentResponse);

          const toAdd = nextIds.filter((id) => !currentIds.includes(id));
          const toRemove = currentIds.filter((id) => !nextIds.includes(id));

          if (toAdd.length > 0 || toRemove.length > 0) {
            await Promise.allSettled([
              ...toAdd.map((id) => authApi.post(`/tasks/${taskId}/assignees/${id}`, {})),
              ...toRemove.map((id) => authApi.delete(`/tasks/${taskId}/assignees/${id}`)),
            ]);
          }
        } catch (assigneeErr) {
          console.warn(`Failed to sync assignees for task ${taskId}:`, assigneeErr);
        }
      }

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setError(errorMessage);
      console.error('Error updating task:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateTask,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to update task status (for Kanban)
export function useUpdateTaskStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTaskStatus = async (taskId: number, state: string): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.patch<Task>(`/tasks/${taskId}`, { State: state });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task status';
      setError(errorMessage);
      console.error('Error updating task status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateTaskStatus,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to delete a task
export function useDeleteTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTask = async (taskId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      console.log(`[useDeleteTask] Attempting to delete task ${taskId}`);
      await authApi.delete<void>(`/tasks/${taskId}`);
      console.log(`[useDeleteTask] Successfully deleted task ${taskId}`);
      return true;
    } catch (error) {
      console.error('[useDeleteTask] Error deleting task:', error);
      console.error('[useDeleteTask] Task ID:', taskId);

      if (isApiException(error)) {
        console.error('[useDeleteTask] Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          path: error.path,
          method: error.method,
          timestamp: error.timestamp,
          requestId: error.requestId,
        });
      }

      let errorMessage = 'Failed to delete task';
      const statusCode = getStatusCode(error);

      if (statusCode === 404) {
        errorMessage = 'Task not found. It may have already been deleted.';
      } else if (statusCode === 403) {
        errorMessage = 'You do not have permission to delete this task.';
      } else if (statusCode === 500) {
        errorMessage = 'Server error occurred while deleting the task. Please try again later.';
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteTask,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to fetch Kanban board for a project
export function useKanbanBoard(projectId: number) {
  const [kanbanBoard, setKanbanBoard] = useState<KanbanBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKanbanBoard = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`[useKanbanBoard] Fetching kanban board for project ${projectId}`);
      const response = await authApi.get<KanbanBoard>(`/projects/${projectId}/kanban`);
      console.log('[useKanbanBoard] Response received:', response);
      setKanbanBoard(response);
    } catch (err) {
      console.error('Error fetching Kanban board:', err);
      console.error('Project ID:', projectId);
      console.error('API URL:', `/projects/${projectId}/kanban`);

      // Fallback: Try to fetch tasks and organize them into kanban columns
      console.log('[useKanbanBoard] === FALLBACK STARTED ===');
      try {
        console.log('[useKanbanBoard] Trying fallback: fetch project tasks');
        console.log('[useKanbanBoard] Fallback URL:', `/projects/${projectId}/tasks`);

        // Try multiple possible endpoints
        let tasksResponse: TaskListResponse;
        try {
          tasksResponse = await authApi.get<TaskListResponse>(`/projects/${projectId}/tasks`);
          console.log('[useKanbanBoard] Tasks endpoint worked');
        } catch (tasksErr) {
          console.log('[useKanbanBoard] Tasks endpoint failed, trying alternatives');
          console.error('[useKanbanBoard] Tasks endpoint error:', tasksErr);

          try {
            tasksResponse = await authApi.get<TaskListResponse>(`/tasks?project_id=${projectId}`);
            console.log('[useKanbanBoard] Alternative tasks endpoint worked');
          } catch (altErr) {
            console.error('[useKanbanBoard] Alternative endpoint also failed:', altErr);
            throw tasksErr; // Throw original error
          }
        }
        console.log('[useKanbanBoard] Tasks response received:', tasksResponse);
        console.log('[useKanbanBoard] Response type:', typeof tasksResponse);
        console.log('[useKanbanBoard] Is array?', Array.isArray(tasksResponse));

        const { tasks } = normalizeTaskListResponse(tasksResponse);

        console.log('[useKanbanBoard] Extracted tasks:', tasks);

        // Always create kanban data, even if no tasks
        const kanbanData: KanbanBoard = {
          project_id: projectId,
          project_name: `Project ${projectId}`, // We don't have project name here
          columns: {
            'To Do': tasks.filter(task => task.state === 'To Do'),
            'In Progress': tasks.filter(task => task.state === 'In Progress'),
            'Done': tasks.filter(task => task.state === 'Done')
          }
        };
        console.log('[useKanbanBoard] Created kanban data:', kanbanData);
        setKanbanBoard(kanbanData);
      } catch (fallbackErr) {
        console.error('[useKanbanBoard] Fallback failed:', fallbackErr);
        console.error('[useKanbanBoard] Fallback error details:', {
          message: fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error',
          stack: fallbackErr instanceof Error ? fallbackErr.stack : undefined,
          response: fallbackErr
        });

        // Final fallback: Create empty kanban board
        console.log('[useKanbanBoard] Creating empty kanban board as final fallback');
        const emptyKanbanData: KanbanBoard = {
          project_id: projectId,
          project_name: `Project ${projectId}`,
          columns: {
            'To Do': [],
            'In Progress': [],
            'Done': []
          }
        };
        setKanbanBoard(emptyKanbanData);

        // Show warning instead of error
        const errorMessage = fallbackErr instanceof Error ? fallbackErr.message : 'Failed to fetch tasks';
        console.warn(`[useKanbanBoard] Tasks API not available: ${errorMessage}. Showing empty board.`);
        setError(null); // Clear error to show empty board
      }
      console.log('[useKanbanBoard] === FALLBACK COMPLETED ===');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchKanbanBoard();
  }, [fetchKanbanBoard]);

  const forceRefresh = useCallback(async () => {
    console.log('[useKanbanBoard] Force refresh requested');
    await fetchKanbanBoard();
  }, [fetchKanbanBoard]);

  return {
    kanbanBoard,
    loading,
    error,
    refetch: fetchKanbanBoard,
    forceRefresh
  };
}

// Hook to assign users to a task
export function useAssignUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignUsers = async (taskId: number, data: AssignUsersRequest): Promise<AssignUsersResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        user_ids: data.user_ids,
      };

      if (data.notification_message) {
        payload.notification_message = data.notification_message;
      }

      const response = await authApi.post<AssignUsersResponse>(`/projects/tasks/${taskId}/assign`, payload);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign users';
      setError(errorMessage);
      console.error('Error assigning users:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignUsers,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to fetch subtasks
export function useSubtasks(taskId: number) {
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<TaskPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubtasks = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.get<SubtasksResponse>(`/tasks/${taskId}/subtasks`);
      setSubtasks(response.data || []);
      setPagination(response.meta || null);
    } catch (error) {
      const statusCode = getStatusCode(error);
      const message = error instanceof Error ? error.message : '';

      if (statusCode === 404 || message.includes('404') || message.includes('Cannot GET')) {
        console.warn(`Subtasks endpoint not available for task ${taskId}`);
        setSubtasks([]);
        setPagination(null);
        setError(null);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subtasks';
        setError(errorMessage);
        console.error('Error fetching subtasks:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchSubtasks();
  }, [fetchSubtasks]);

  return {
    subtasks,
    pagination,
    loading,
    error,
    refetch: fetchSubtasks
  };
}

// Hook for time tracking
export function useTimeEntries(taskId: number) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeEntries = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.get<TimeEntriesResponse>(`/tasks/${taskId}/time-entries`);
      setTimeEntries(response.data || []);
      setTotalHours(response.total_hours || 0);
    } catch (error) {
      const statusCode = getStatusCode(error);
      const message = error instanceof Error ? error.message : '';

      if (statusCode === 404 || message.includes('404') || message.includes('Cannot GET')) {
        console.warn(`Time entries endpoint not available for task ${taskId}`);
        setTimeEntries([]);
        setTotalHours(0);
        setError(null);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time entries';
        setError(errorMessage);
        console.error('Error fetching time entries:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  return {
    timeEntries,
    totalHours,
    loading,
    error,
    refetch: fetchTimeEntries
  };
}

// Hook to create time entry
export function useCreateTimeEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTimeEntry = async (data: CreateTimeEntryRequest): Promise<TimeEntry | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.post<TimeEntry>('/tasks/time-entries', data as unknown as Record<string, unknown>);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create time entry';
      setError(errorMessage);
      console.error('Error creating time entry:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTimeEntry,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to delete time entry
export function useDeleteTimeEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTimeEntry = async (entryId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await authApi.delete<void>(`/tasks/time-entries/${entryId}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete time entry';
      setError(errorMessage);
      console.error('Error deleting time entry:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteTimeEntry,
    loading,
    error,
    clearError: () => setError(null)
  };
}
