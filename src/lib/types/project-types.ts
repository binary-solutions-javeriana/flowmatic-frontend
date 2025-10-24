// Project types and interfaces

export interface Project {
  proyect_id: number;
  name_proyect: string;
  description?: string;
  state: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  created_by?: number;
  // Optional timestamp fields - may not exist in all backend versions
  created_at?: string;
  updated_at?: string;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface ProjectPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectsResponse {
  data: Project[];
  meta: ProjectPagination;
}

export interface CreateProjectRequest {
  name_proyect: string;
  description?: string;
  state: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  created_by: number;
}

export interface UpdateProjectRequest {
  name_proyect?: string;
  description?: string;
  state?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
}

