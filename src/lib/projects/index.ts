// Main entry point for projects module
// Re-exports hooks from use-projects with compatible interface

import { 
  useProjects as useProjectsHook,
  useProject as useProjectHook,
  useCreateProject as useCreateProjectHook,
  useUpdateProject as useUpdateProjectHook,
  useDeleteProject as useDeleteProjectHook,
  useRecentProjects as useRecentProjectsHook,
} from '../hooks/use-projects';

import type { ProjectFilters } from './types';

/**
 * Hook for fetching and managing projects with extended functionality
 */
export function useProjects(initialFilters?: ProjectFilters) {
  const hookResult = useProjectsHook(initialFilters);
  const { createProject: createFn, loading: createLoading } = useCreateProjectHook();
  const { updateProject: updateFn, loading: updateLoading } = useUpdateProjectHook();
  const { deleteProject: deleteFn, loading: deleteLoading } = useDeleteProjectHook();

  return {
    ...hookResult,
    createProject: createFn,
    updateProject: updateFn,
    deleteProject: deleteFn,
    isCreating: createLoading,
    isUpdating: updateLoading,
    isDeleting: deleteLoading,
  };
}

// Re-export other hooks
export { useProjectHook as useProject };
export { useCreateProjectHook as useCreateProject };
export { useUpdateProjectHook as useUpdateProject };
export { useDeleteProjectHook as useDeleteProject };
export { useRecentProjectsHook as useRecentProjects };

// Re-export types
export * from './types';
export * from './utils';
export * from './validation';

