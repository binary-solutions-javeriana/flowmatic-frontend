"use client";

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../authenticated-api';
import { useAuthState } from '../auth-store';
import type { 
  Project, 
  ProjectFilters, 
  ProjectsResponse,
  CreateProjectRequest,
  ProjectPagination
} from '../types/project-types';

// Backend response types
interface BackendProject {
  proyect_id?: number;
  ProjectID?: number;
  id?: number;
  name_proyect?: string;
  NameProject?: string;
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  Mail?: string;
  state?: string;
  State?: string;
  type?: string;
  MethodologyName?: string;
  MethodologyID?: number;
  start_date?: string;
  Start_date?: string;
  end_date?: string;
  End_date?: string;
  TenantID?: number;
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
  created_by?: number;
}

interface BackendMethodology {
  MethodologyID?: number;
  id?: number;
  methodologyId?: number;
  Name?: string;
  name?: string;
}

interface BackendApiResponse<T> {
  data?: T;
  meta?: ProjectPagination;
}

// Hook to fetch all projects with filters
// Adapt various backend shapes to our UI Project type
function adaptBackendProjectToUI(item: BackendProject): Project {
  const proyect_id = item?.proyect_id ?? item?.ProjectID ?? item?.id;
  const name_proyect = item?.name_proyect ?? item?.NameProject ?? item?.name ?? item?.Name;
  const description = item?.description ?? item?.Description ?? undefined;
  const mail = item?.Mail ?? undefined;
  const state = item?.state ?? item?.State ?? 'Planning';
  const type = item?.type ?? item?.MethodologyName ?? undefined;
  const start_date = item?.start_date ?? item?.Start_date ?? undefined;
  const end_date = item?.end_date ?? item?.End_date ?? undefined;
  const created_at = item?.created_at ?? item?.CreatedAt ?? '';
  const created_by = item?.created_by ?? undefined;

  return {
    proyect_id: Number(proyect_id),
    name_proyect: String(name_proyect || ''),
    description,
    mail: mail ? String(mail) : undefined,
    state: String(state || 'Planning'),
    type: type ? String(type) : undefined,
    start_date: start_date ? String(start_date) : undefined,
    end_date: end_date ? String(end_date) : undefined,
    created_by: typeof created_by === 'number' ? created_by : undefined,
    created_at: created_at ? String(created_at) : '',
  };
}

export function useProjects(initialFilters?: ProjectFilters) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<ProjectPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthState();

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
      const mail = user?.email;
      const url = mail
        ? `/projects/by-mail?mail=${encodeURIComponent(mail)}&${queryString}&orderBy=ProjectID&order=desc`
        : `/projects?${queryString}`;

      console.log('[useProjects] Fetching projects with URL:', url);
      console.log('[useProjects] Filters:', filters);
      console.log('[useProjects] API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

      const response = await authApi.get<BackendProject[] | BackendApiResponse<BackendProject[]>>(url);
      
      console.log('[useProjects] Response received:', response);
      if (!Array.isArray(response)) {
        console.log('[useProjects] Response data:', response?.data);
        console.log('[useProjects] Response meta:', response?.meta);
        console.log('[useProjects] Number of projects:', response?.data?.length || 0);
      } else {
        console.log('[useProjects] Response is array with length:', response.length);
      }
      
      const items: BackendProject[] = Array.isArray(response)
        ? response
        : Array.isArray((response as BackendApiResponse<BackendProject[]>)?.data)
          ? (response as BackendApiResponse<BackendProject[]>).data || []
          : [];

      const adapted = items.map(adaptBackendProjectToUI);

      setProjects(adapted);
      setPagination((response as BackendApiResponse<BackendProject[]>)?.meta || null);
      
      console.log('[useProjects] Projects state updated with', items.length, 'projects');
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
  }, [user?.email]);

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
      const response = await authApi.get<BackendProject>(`/projects/${projectId}`);
      const adapted = adaptBackendProjectToUI(response);
      setProject(adapted);
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
  const { user } = useAuthState();

  const createProject = async (data: CreateProjectRequest): Promise<Project | null> => {
    setLoading(true);
    setError(null);

    try {
      // Get TenantID from user metadata
      const tenantId = user?.user_metadata?.tenantId as number | undefined;
      
      // Map UI payload to backend schema
      const payload: Record<string, unknown> = {
        NameProject: data.name_proyect,
        Description: data.description,
        Mail: user?.email || '',
        Start_date: data.start_date || undefined,
        End_date: data.end_date || undefined,
        State: data.state,
        MethodologyName: data.type || undefined,
        ...(tenantId !== undefined && { TenantID: tenantId }),
      };

      // Basic validation aligned with backend expectations
      if (!payload.NameProject || typeof payload.NameProject !== 'string') {
        throw new Error('Project name is required');
      }
      if (!payload.Mail || typeof payload.Mail !== 'string') {
        throw new Error('Mail (current user email) is required');
      }

      const response = await authApi.post<Project>('/projects', payload);
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
  const { user } = useAuthState();
  const ensureMethodology = useCallback(async (name?: string): Promise<number | undefined> => {
    if (!name || !name.trim()) return undefined;
    try {
      // Try to find by name using the search endpoint
      const queryName = encodeURIComponent(name.trim());
      const found = await authApi.get<BackendMethodology>(`/methodologies/search?name=${queryName}`);

      if (found && (found.MethodologyID || found.id || found.methodologyId)) {
        const idFromFound = found.MethodologyID ?? found.id ?? found.methodologyId;
        return Number(idFromFound);
      }

      // Create if not found
      const created = await authApi.post<BackendMethodology>(`/methodologies`, { Name: name.trim() } as unknown as Record<string, unknown>);
      const idFromCreated = created?.MethodologyID ?? created?.id ?? created?.methodologyId;
      return idFromCreated ? Number(idFromCreated) : undefined;
    } catch (e) {
      console.warn('[useUpdateProject] Failed to ensure methodology, continuing without one:', e);
      return undefined;
    }
  }, []);

  const updateProject = async (projectId: number, data: Partial<CreateProjectRequest>): Promise<Project | null> => {
    setLoading(true);
    setError(null);

    try {
      const methodologyId = await ensureMethodology(data.type);
      const payload: Record<string, unknown> = {
        NameProject: data.name_proyect,
        Description: data.description,
        Mail: user?.email || undefined,
        Start_date: data.start_date,
        End_date: data.end_date,
        State: data.state,
        MethodologyID: methodologyId,
      };

      // Remove undefined fields for a clean PATCH
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) {
          delete payload[k];
        }
      });

      const response = await authApi.patch<Project>(`/projects/${projectId}`, payload);
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
      const response = await authApi.get<ProjectsResponse>(`/projects?limit=${limit}&orderBy=title&order=asc`);
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

