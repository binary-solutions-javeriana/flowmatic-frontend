import { useState, useEffect, useCallback } from 'react';
import { projectsService } from '@/lib/services/projects-service';
import { config } from '@/lib/config';
import type { 
  Project, 
  PaginatedProjects, 
  ProjectFilters 
} from '@/lib/types/project-types';

// Helper function to get token from localStorage
const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(config.auth.accessTokenKey);
  }
  return null;
};

export function useProjects(filters: ProjectFilters = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginatedProjects['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (newFilters: ProjectFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getStoredToken();
      const combinedFilters = { ...filters, ...newFilters };
      
      const result = await projectsService.getProjects(combinedFilters, token || undefined);
      setProjects(result.data);
      setPagination(result.meta);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const searchProjects = useCallback(async (searchFilters: ProjectFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getStoredToken();
      const result = await projectsService.searchProjects(searchFilters, token || undefined);
      setProjects(result.data);
      setPagination(result.meta);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search projects';
      setError(message);
      console.error('Error searching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Listen for storage events to refresh when projects are created/updated
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'project_updated' || e.key === 'project_created') {
        fetchProjects();
        localStorage.removeItem(e.key); // Clean up the flag
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on component focus
    const handleFocus = () => {
      if (localStorage.getItem('project_updated') || localStorage.getItem('project_created')) {
        fetchProjects();
        localStorage.removeItem('project_updated');
        localStorage.removeItem('project_created');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchProjects]);

  return {
    projects,
    pagination,
    loading,
    error,
    fetchProjects,
    searchProjects,
    refetch: () => fetchProjects()
  };
}

export function useRecentProjects(limit: number = 5) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getStoredToken();
      const result = await projectsService.getRecentProjects(limit, token || undefined);
      setProjects(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recent projects';
      setError(message);
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

export function useProject(id: number) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getStoredToken();
      const result = await projectsService.getProjectById(id, token || undefined);
      setProject(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(message);
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id, fetchProject]);

  return {
    project,
    loading,
    error,
    refetch: fetchProject
  };
}

// Hook for deleting projects
export function useDeleteProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProject = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = getStoredToken();
      await projectsService.deleteProject(id, token || undefined);
      
      // Signal that project was deleted for cache invalidation
      localStorage.setItem('project_deleted', 'true');
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      setError(message);
      console.error('Error deleting project:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProject,
    loading,
    error
  };
}