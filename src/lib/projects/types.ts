// Re-export project types for compatibility
export type {
  Project,
  ProjectFilters,
  ProjectsResponse,
  ProjectPagination,
  CreateProjectRequest as CreateProjectDto,
  UpdateProjectRequest as UpdateProjectDto,
} from '../types/project-types';

export type ProjectState = 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';

