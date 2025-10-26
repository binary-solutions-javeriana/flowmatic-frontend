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
  TaskStats
} from '../types/task-types';

// Hook to fetch all tasks with filters
export function useTasks(initialFilters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<any>(null);
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
  const [pagination, setPagination] = useState<any>(null);
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

      const response = await authApi.get<TasksResponse>(url);
      
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format: response is not an object');
      }
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error(`Invalid response format: data is ${response.data ? 'not an array' : 'missing'}`);
      }
      
      setTasks(response.data);
      setPagination(response.meta || null);
      
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
      // Map UI payload (aliases) to backend schema
      const projectId = (data as any).project_id ?? (data as any).proyect_id;
      // Normalize priority to numeric 1-5 as required by backend validation
      const rawPriority = (data as any).priority;
      const priorityValue = typeof rawPriority === 'number'
        ? rawPriority
        : typeof rawPriority === 'string'
          ? ({ low: 1, bajo: 1, medium: 3, medio: 3, high: 4, alto: 4, critical: 5 } as Record<string, number>)[rawPriority.toLowerCase()]
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
      };

      // Basic validation
      if (!payload.ProjectID) throw new Error('ProjectID is required');
      if (!payload.Title) throw new Error('Title is required');
      if (!payload.State) throw new Error('State is required');

      let response: Task;
      if (projectId) {
        response = await authApi.post<Task>(`/projects/${projectId}/tasks`, payload);
      } else {
        response = await authApi.post<Task>('/tasks', payload);
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
        let tasksResponse;
        try {
          tasksResponse = await authApi.get<any>(`/projects/${projectId}/tasks`);
          console.log('[useKanbanBoard] Tasks endpoint worked');
        } catch (tasksErr) {
          console.log('[useKanbanBoard] Tasks endpoint failed, trying alternatives');
          console.error('[useKanbanBoard] Tasks endpoint error:', tasksErr);
          
          // Try alternative endpoints
          try {
            tasksResponse = await authApi.get<any>(`/tasks?project_id=${projectId}`);
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
        } else if (tasksResponse.tasks && Array.isArray(tasksResponse.tasks)) {
          // Alternative wrapper
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
  const [pagination, setPagination] = useState<any>(null);
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
