"use client";

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../authenticated-api';
import type { 
  Project, 
  ProjectFilters, 
  ProjectsResponse,
  CreateProjectRequest,
  ProjectPagination
} from '../types/project-types';

// Hook to fetch all projects with filters
export function useProjects(initialFilters?: ProjectFilters) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<ProjectPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (filters?: ProjectFilters) => {
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
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.orderBy) params.append('orderBy', filters.orderBy);
      if (filters?.order) params.append('order', filters.order);

      const queryString = params.toString();
      const url = `/projects?${queryString}`;

      console.log('[useProjects] Fetching projects with URL:', url);
      console.log('[useProjects] Filters:', filters);
      console.log('[useProjects] API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

      const response = await authApi.get<ProjectsResponse>(url);
      
      console.log('[useProjects] Response received:', response);
      console.log('[useProjects] Response data:', response?.data);
      console.log('[useProjects] Response meta:', response?.meta);
      console.log('[useProjects] Number of projects:', response?.data?.length || 0);
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format: response is not an object');
      }
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('[useProjects] Invalid data structure. Expected { data: [], meta: {} }, got:', response);
        throw new Error(`Invalid response format: data is ${response.data ? 'not an array' : 'missing'}`);
      }
      
      setProjects(response.data);
      setPagination(response.meta || null);
      
      console.log('[useProjects] Projects state updated with', response.data.length, 'projects');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      console.error('[useProjects] Error fetching projects:', err);
      console.error('[useProjects] Error details:', {
        message: errorMessage,
        error: err,
        stack: err instanceof Error ? err.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    projects,
    pagination,
    loading,
    error,
    fetchProjects,
    refetch: () => fetchProjects(initialFilters)
  };
}

// Hook to fetch a single project
export function useProject(projectId: number) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.get<Project>(`/projects/${projectId}`);
      setProject(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(errorMessage);
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refetch: fetchProject
  };
}

// Hook to create a project
export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (data: CreateProjectRequest): Promise<Project | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.post<Project>('/projects', data as unknown as Record<string, unknown>);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      console.error('Error creating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to update a project
export function useUpdateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProject = async (projectId: number, data: Partial<CreateProjectRequest>): Promise<Project | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.patch<Project>(`/projects/${projectId}`, data as unknown as Record<string, unknown>);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      console.error('Error updating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProject,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to delete a project
export function useDeleteProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProject = async (projectId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // DELETE returns 204 No Content (no response body)
      await authApi.delete<void>(`/projects/${projectId}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      console.error('Error deleting project:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProject,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// Hook to fetch recent projects
export function useRecentProjects(limit: number = 5) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.get<ProjectsResponse>(`/projects?limit=${limit}&orderBy=updated_at&order=desc`);
      setProjects(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent projects';
      setError(errorMessage);
      console.error('Error fetching recent projects:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecentProjects();
  }, [fetchRecentProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchRecentProjects
  };
}

