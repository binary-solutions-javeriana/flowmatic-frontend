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

  const fetchProjectTasks = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // Build query string from filters
      const params = new URLSearchParams();

      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 10;

      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filters?.search) params.append('search', filters.search);
      if (filters?.state) params.append('state', filters.state);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);

      const queryString = params.toString();
      const url = `/projects/${projectId}/tasks?${queryString}`;

      console.log('[useProjectTasks] Fetching project tasks with URL:', url);
      console.log('[useProjectTasks] Filters:', filters);

      const response = await authApi.get<TasksResponse>(url);

      console.log('[useProjectTasks] Response received:', response);
      console.log('[useProjectTasks] Response type:', typeof response);

      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format: response is not an object');
      }

      // Handle different response structures (similar to useTasks)
      let tasksArray: Task[] = [];
      if (Array.isArray(response)) {
        // Direct array response
        tasksArray = response;
        console.log('[useProjectTasks] Response is direct array with', response.length, 'tasks');
      } else if (response.data && Array.isArray(response.data)) {
        // Wrapped in data property
        tasksArray = response.data;
        console.log('[useProjectTasks] Response has data array with', response.data.length, 'tasks');
      } else if ('tasks' in response && response.tasks && Array.isArray(response.tasks)) {
        // Alternative wrapper (BackendTasksResponse)
        tasksArray = response.tasks;
        console.log('[useProjectTasks] Response has tasks array with', response.tasks.length, 'tasks');
      } else {
        console.error('[useProjectTasks] Invalid data structure. Expected array or { data: [], meta: {} }, got:', response);
        throw new Error(`Invalid response format: data is ${response.data ? 'not an array' : 'missing'}`);
      }

      setTasks(tasksArray);
      setPagination(response.meta || null);

      console.log('[useProjectTasks] Tasks state updated with', tasksArray.length, 'tasks');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project tasks';
      setError(errorMessage);
      console.error('[useProjectTasks] Error fetching project tasks:', err);
      console.error('[useProjectTasks] Project ID:', projectId);
      console.error('[useProjectTasks] API URL:', `/projects/${projectId}/tasks`);
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
      let response: Task;
      
      if (data.ProjectID) {
        // Create task via project endpoint
        response = await authApi.post<Task>(`/projects/${data.ProjectID}/tasks`, data as unknown as Record<string, unknown>);
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
      const response = await authApi.patch<Task>(`/tasks/${taskId}`, data as unknown as Record<string, unknown>);
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
      const response = await authApi.patch<Task>(`/projects/tasks/${taskId}/status`, { state });
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
      await authApi.delete<void>(`/tasks/${taskId}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      console.error('Error deleting task:', err);
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
            'Done': tasks.filter(task => task.state === 'Done'),
            'Cancelled': tasks.filter(task => task.state === 'Cancelled')
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
            'Done': [],
            'Cancelled': []
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subtasks';
      setError(errorMessage);
      console.error('Error fetching subtasks:', err);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time entries';
      setError(errorMessage);
      console.error('Error fetching time entries:', err);
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
