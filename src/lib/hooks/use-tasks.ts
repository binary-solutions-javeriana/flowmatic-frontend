"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  SubtasksResponse
} from '../types/task-types';

// Pagination type
interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

// Backend response type for tasks (can be array or wrapped)
interface BackendTasksResponse {
  data?: Task[];
  tasks?: Task[];
  meta?: TaskPagination;
}

// Hook to fetch all tasks with filters
export function useTasks(initialFilters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<TaskPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('[useTasks] Error fetching tasks:', err);
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
export function useProjectTasks(projectId: number, filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<TaskPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.page,
    filters?.limit,
    filters?.search,
    filters?.state,
    filters?.priority,
    filters?.assigned_to
  ]);

  const fetchProjectTasks = useCallback(async () => {
    if (projectId == null) return;

    setLoading(true);
    setError(null);

    try {
      // Use the correct endpoint for project tasks
      const params = new URLSearchParams();

      const page = memoizedFilters?.page ?? 1;
      const limit = memoizedFilters?.limit ?? 10;

      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (memoizedFilters?.search) params.append('search', memoizedFilters.search);
      if (memoizedFilters?.state) params.append('state', memoizedFilters.state);
      if (memoizedFilters?.priority) params.append('priority', memoizedFilters.priority);
      if (memoizedFilters?.assigned_to) params.append('assigned_to', memoizedFilters.assigned_to);

      const queryString = params.toString();
      const url = `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;

      console.log('[useProjectTasks] Fetching project tasks with URL:', url);

      const response = await authApi.get<any>(url);

      console.log('[useProjectTasks] Response received:', response);
      console.log('[useProjectTasks] Response type:', typeof response);
      console.log('[useProjectTasks] Is array?', Array.isArray(response));

      // Handle different response structures
      let tasks: Task[] = [];
      let pagination: any = null;

      if (Array.isArray(response)) {
        // Direct array response
        tasks = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Wrapped in data property
        tasks = response.data;
        pagination = response.meta || null;
      } else if (response.tasks && Array.isArray(response.tasks)) {
        // Alternative wrapper
        tasks = response.tasks;
        pagination = response.meta || null;
      } else {
        throw new Error('Invalid response format: expected array or object with data/tasks property');
      }

      setTasks(tasks);
      setPagination(pagination);

      console.log('[useProjectTasks] Tasks state updated with', tasks.length, 'tasks');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project tasks';
      setError(errorMessage);
      console.error('[useProjectTasks] Error fetching project tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, memoizedFilters]);

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
      // Map UI payload (aliases) to backend schema
      const projectId = (data as any).project_id ?? (data as any).proyect_id;
      // Normalize priority to string value as expected by backend
      const rawPriority = (data as any).priority;
      const priorityValue = typeof rawPriority === 'string'
        ? rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase()
        : undefined;
      const payload: Record<string, unknown> = {
        ProjectID: projectId,
        Title: (data as any).title,
        Description: (data as any).description,
        Priority: priorityValue,
        State: (data as any).state,
        CreatedBy: (data as any).created_by,
        LimitDate: (data as any).limit_date,
        // Backend will read this from a dedicated endpoint/field; we won't send AssignedUserIds anymore
        // Pass assigned_to_ids instead
        AssignedToIDs: (data as any).assigned_to_ids ?? (data as any).assignedToIds

      };

      // Basic validation
      if (!payload.ProjectID) throw new Error('ProjectID is required');
      if (!payload.Title) throw new Error('Title is required');
      if (!payload.State) throw new Error('State is required');

      let response: Task;
      
      if (data.proyect_id) {
        // Create task via project endpoint
        response = await authApi.post<Task>(`/projects/${data.proyect_id}/tasks`, data as unknown as Record<string, unknown>);
      } else {
        // Create standalone task
        response = await authApi.post<Task>('/tasks', data as unknown as Record<string, unknown>);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      console.error('Error creating task:', err);
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
      // Map priority to string value as expected by backend
      const rawPriority = (data as any).priority;
      const priorityValue = typeof rawPriority === 'string'
        ? rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase()
        : undefined;

      const payload: Record<string, unknown> = {
        ...(data as any).title !== undefined && { Title: (data as any).title },
        ...(data as any).description !== undefined && { Description: (data as any).description },
        ...(data as any).state !== undefined && { State: (data as any).state },
        ...(priorityValue !== undefined) && { Priority: priorityValue },
        ...(data as any).limit_date !== undefined && { LimitDate: (data as any).limit_date }
        // Note: assigned_to_ids is handled separately via assign/unassign endpoints
      };

      const response = await authApi.patch<Task>(`/tasks/${taskId}`, payload);

      // Handle assignee changes separately if provided
      if ((data as any).assigned_to_ids !== undefined) {
        // Normaliza entrada del front a arreglo de números
        const nextIds: number[] = Array.isArray((data as any).assigned_to_ids)
          ? (data as any).assigned_to_ids.map(Number).filter(n => !Number.isNaN(n))
          : typeof (data as any).assigned_to_ids === 'string'
            ? (data as any).assigned_to_ids
                .split(',')
                .map(s => Number(s.trim()))
                .filter(n => !Number.isNaN(n))
            : [];

        try {
          // 1) Traer asignados actuales; soporta dos formatos de respuesta
          const current = await authApi.get<any>(`/tasks/${taskId}/assignees`);
          const currentIds: number[] = Array.isArray(current)
            ? (
                // formato A: [{ TaskID, UserID }]
                current.length && typeof current[0] === 'object' && 'UserID' in current[0]
                  ? current.map((a: any) => Number(a.UserID))
                  // formato B: [1,2,3]
                  : current.map(Number)
              ).filter((n: number) => !Number.isNaN(n))
            : [];

          // 2) Calcular delta
          const toAdd = nextIds.filter(id => !currentIds.includes(id));
          const toRemove = currentIds.filter(id => !nextIds.includes(id));

          // 3) Aplicar cambios en paralelo
          await Promise.allSettled([
            ...toAdd.map(id => authApi.post(`/tasks/${taskId}/assignees/${id}`, {})),
            ...toRemove.map(id => authApi.delete(`/tasks/${taskId}/assignees/${id}`))
          ]);
        } catch (assigneeErr) {
          console.warn(`Failed to sync assignees for task ${taskId}:`, assigneeErr);
          // No rompemos toda la actualización si solo falló la sincronización de asignados
        }
      }

      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      console.error('Error updating task:', err);
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
    } catch (err: any) {
      console.error('[useDeleteTask] Error deleting task:', err);
      console.error('[useDeleteTask] Task ID:', taskId);
      console.error('[useDeleteTask] Error details:', {
        message: err?.message,
        statusCode: err?.statusCode,
        path: err?.path,
        method: err?.method,
        timestamp: err?.timestamp
      });

      let errorMessage = 'Failed to delete task';

      if (err?.statusCode === 404) {
        errorMessage = 'Task not found. It may have already been deleted.';
      } else if (err?.statusCode === 403) {
        errorMessage = 'You do not have permission to delete this task.';
      } else if (err?.statusCode === 500) {
        errorMessage = 'Server error occurred while deleting the task. Please try again later.';
      } else if (err?.message) {
        errorMessage = err.message;
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
        let tasksResponse: TasksResponse | BackendTasksResponse;
        try {
          tasksResponse = await authApi.get<TasksResponse | BackendTasksResponse>(`/projects/${projectId}/tasks`);
          console.log('[useKanbanBoard] Tasks endpoint worked');
        } catch (tasksErr) {
          console.log('[useKanbanBoard] Tasks endpoint failed, trying alternatives');
          console.error('[useKanbanBoard] Tasks endpoint error:', tasksErr);

          // Try alternative endpoints
          try {
            tasksResponse = await authApi.get<TasksResponse | BackendTasksResponse>(`/tasks?project_id=${projectId}`);
            console.log('[useKanbanBoard] Alternative tasks endpoint worked');
          } catch (altErr) {
            console.error('[useKanbanBoard] Alternative endpoint also failed:', altErr);
            throw tasksErr; // Throw original error
          }
        }
        console.log('[useKanbanBoard] Tasks response received:', tasksResponse);
        console.log('[useKanbanBoard] Response type:', typeof tasksResponse);
        console.log('[useKanbanBoard] Is array?', Array.isArray(tasksResponse));

        // Handle different response structures
        let tasks: Task[] = [];
        if (Array.isArray(tasksResponse)) {
          // Direct array response
          tasks = tasksResponse;
        } else if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
          // Wrapped in data property
          tasks = tasksResponse.data;
        } else if ('tasks' in tasksResponse && tasksResponse.tasks && Array.isArray(tasksResponse.tasks)) {
          // Alternative wrapper (BackendTasksResponse)
          tasks = tasksResponse.tasks;
        }

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
      const response = await authApi.post<AssignUsersResponse>(`/projects/tasks/${taskId}/assign`, data as unknown as Record<string, unknown>);
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
    } catch (err: any) {
      // Handle 404 errors gracefully - endpoint may not be implemented
      if (err?.statusCode === 404 || err?.message?.includes('404') || err?.message?.includes('Cannot GET')) {
        console.warn(`Subtasks endpoint not available for task ${taskId}`);
        setSubtasks([]);
        setPagination(null);
        setError(null); // Clear error to prevent UI issues
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subtasks';
        setError(errorMessage);
        console.error('Error fetching subtasks:', err);
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
    } catch (err: any) {
      // Handle 404 errors gracefully - endpoint may not be implemented
      if (err?.statusCode === 404 || err?.message?.includes('404') || err?.message?.includes('Cannot GET')) {
        console.warn(`Time entries endpoint not available for task ${taskId}`);
        setTimeEntries([]);
        setTotalHours(0);
        setError(null); // Clear error to prevent UI issues
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time entries';
        setError(errorMessage);
        console.error('Error fetching time entries:', err);
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
