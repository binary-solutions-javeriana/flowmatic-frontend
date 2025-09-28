// Project types based on your backend API
export interface Project {
  proyect_id: number;
  name_proyect: string;
  description?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  state: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  team_members: number;
  budget_used_percentage: number;
  days_remaining: number;
  last_activity: string;
}

export interface ProjectUser {
  user_id: number;
  role: string;
  permissions: string[];
  joined_date: string;
  hourly_rate?: number;
}

export interface PaginatedProjects {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}