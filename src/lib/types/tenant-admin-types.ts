// Tenant Admin API Types based on OpenAPI spec

export type UserRole = 'PROFESOR' | 'ESTUDIANTE';

export interface CreateUserRequest {
  name: string;
  mail: string;
  rol: UserRole;
}

export interface UserResponse {
  userId: number;
  name: string;
  mail: string;
  rol: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDto {
  tenantId: number;
  universityName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummaryDto {
  projectId: number;
  nameProject: string;
  state: string;
  startDate: string;
  endDate: string;
  taskCount: number;
  completedTasks: number;
}

export interface TenantKpiDto {
  activeProjects: number;
  completedTasks: number;
  userEngagement: number; // Percentage 0-100
  projectCompletionRate: number; // Percentage 0-100
}

export interface TenantDashboardResponse {
  tenantInfo: TenantDto;
  totalUsers: number;
  totalProjects: number;
  kpis: TenantKpiDto;
  recentProjects: ProjectSummaryDto[];
}

export interface ErrorResponse {
  error: 'RESOURCE_NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
  timestamp: string;
}

