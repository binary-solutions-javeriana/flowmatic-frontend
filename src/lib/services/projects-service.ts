import { config } from '@/lib/config';
import { getUserIdFromToken } from '@/lib/auth-utils';
import type { 
  Project, 
  PaginatedProjects, 
  ProjectFilters, 
  ProjectStats 
} from '@/lib/types/project-types';
import type {
  CreateProjectDto,
  UpdateProjectDto
} from '@/lib/types/project-dto';
import { cleanProjectData } from '@/lib/types/project-dto';

class ProjectsService {
  private baseUrl = `${config.api.apiUrl}/projects`;

  async getProjects(
    filters: ProjectFilters = {},
    token?: string
  ): Promise<PaginatedProjects> {
    const searchParams = new URLSearchParams();
    
    // Always include page and limit as backend requires them
    searchParams.append('page', String(filters.page || 1));
    searchParams.append('limit', String(filters.limit || 10));
    
    // Only add other valid parameters that backend accepts
    const validParams = ['search', 'status', 'type'];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && validParams.includes(key)) {
        searchParams.append(key, String(value));
      }
    });

    const url = `${this.baseUrl}?${searchParams.toString()}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    return response.json();
  }

  async searchProjects(
    filters: ProjectFilters = {},
    token?: string
  ): Promise<PaginatedProjects> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const url = `${this.baseUrl}/search?${searchParams.toString()}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to search projects: ${response.statusText}`);
    }

    return response.json();
  }

  async getProjectById(
    id: number,
    token?: string
  ): Promise<Project> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    return response.json();
  }

  async getProjectStats(
    id: number,
    token?: string
  ): Promise<ProjectStats> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/${id}/stats`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project stats: ${response.statusText}`);
    }

    return response.json();
  }

  async getRecentProjects(
    limit: number = 5,
    token?: string
  ): Promise<Project[]> {
    const filters: ProjectFilters = {
      page: 1,
      limit
    };

    const result = await this.getProjects(filters, token);
    return result.data;
  }

  async createProject(
    projectData: Partial<Project>,
    token?: string
  ): Promise<Project> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Get user ID from token for created_by field
    const userId = getUserIdFromToken(token);
    if (!userId) {
      throw new Error('Unable to get user ID from token');
    }

    // Clean and prepare data with user ID
    const cleanData = cleanProjectData(projectData, userId);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create project: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async updateProject(
    id: number,
    projectData: Partial<Project>,
    token?: string
  ): Promise<Project> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Clean data for update (don't include created_by for updates)
    const cleanData = cleanProjectData(projectData);

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update project: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async deleteProject(
    id: number,
    token?: string
  ): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`);
    }
  }
}

export const projectsService = new ProjectsService();