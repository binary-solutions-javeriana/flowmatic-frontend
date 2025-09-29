// DTOs for project creation and updates based on backend API
export interface CreateProjectDto {
  name_proyect: string;
  description?: string;
  type?: string;
  start_date?: string; // ISO date string
  end_date?: string;  // ISO date string
  state?: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  created_by: number;  // Required field from backend
}

export type UpdateProjectDto = Partial<CreateProjectDto>;

export interface ProjectFormData {
  name_proyect: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  state: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
}

// Helper function to clean data for API requests
export const cleanProjectData = (
  data: Partial<ProjectFormData>,
  userId?: number
): CreateProjectDto | UpdateProjectDto => {
  const cleaned: Record<string, unknown> = {};

  // Required field
  if (data.name_proyect?.trim()) {
    cleaned.name_proyect = data.name_proyect.trim();
  }

  // Optional string fields - only include if not empty
  if (data.description?.trim()) {
    cleaned.description = data.description.trim();
  }
  
  if (data.type?.trim()) {
    cleaned.type = data.type.trim();
  }

  // Date fields - only include if not empty
  if (data.start_date?.trim()) {
    cleaned.start_date = data.start_date;
  }
  
  if (data.end_date?.trim()) {
    cleaned.end_date = data.end_date;
  }

  // State field
  if (data.state) {
    cleaned.state = data.state;
  }

  // Add created_by field for creation (required by backend)
  if (userId) {
    cleaned.created_by = userId;
  }

  return cleaned;
};