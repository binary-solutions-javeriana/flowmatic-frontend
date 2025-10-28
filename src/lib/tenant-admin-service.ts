// Tenant Admin Service - API calls for tenant administrator operations
// Uses direct connection to Java backend at localhost:8080/api/v1

import { tenantAdminAuthApi } from './tenant-admin-api';
import type {
  TenantDashboardResponse,
  UserResponse,
  CreateUserRequest,
  ProjectSummaryDto
} from './types/tenant-admin-types';

export class TenantAdminService {
  /**
   * Get tenant admin dashboard data including KPIs, tenant info, and recent projects
   * @param tenantAdminId - The tenant admin user ID
   */
  async getDashboardData(tenantAdminId: number): Promise<TenantDashboardResponse> {
    return tenantAdminAuthApi.get<TenantDashboardResponse>(`/tenant-admin/${tenantAdminId}/dashboard`);
  }

  /**
   * Get all users in the tenant
   * @param tenantAdminId - The tenant admin user ID
   */
  async getUsers(tenantAdminId: number): Promise<UserResponse[]> {
    return tenantAdminAuthApi.get<UserResponse[]>(`/tenant-admin/${tenantAdminId}/users`);
  }

  /**
   * Get a specific user by ID
   * @param tenantAdminId - The tenant admin user ID
   * @param userId - The user ID to fetch
   */
  async getUser(tenantAdminId: number, userId: number): Promise<UserResponse> {
    return tenantAdminAuthApi.get<UserResponse>(`/tenant-admin/${tenantAdminId}/users/${userId}`);
  }

  /**
   * Get all projects within the tenant (summary list)
   * @param tenantAdminId - The tenant admin user ID
   */
  async getProjects(tenantAdminId: number): Promise<ProjectSummaryDto[]> {
    return tenantAdminAuthApi.get<ProjectSummaryDto[]>(`/tenant-admin/${tenantAdminId}/projects`);
  }

  /**
   * Create a new user in the tenant
   * @param tenantAdminId - The tenant admin user ID
   * @param userData - The user data to create
   */
  async createUser(tenantAdminId: number, userData: CreateUserRequest): Promise<UserResponse> {
    return tenantAdminAuthApi.post<UserResponse>(`/tenant-admin/${tenantAdminId}/users`, userData as unknown as Record<string, unknown>);
  }

  /**
   * Update an existing user
   * @param tenantAdminId - The tenant admin user ID
   * @param userId - The user ID to update
   * @param userData - The updated user data
   */
  async updateUser(
    tenantAdminId: number,
    userId: number,
    userData: CreateUserRequest
  ): Promise<UserResponse> {
    return tenantAdminAuthApi.put<UserResponse>(`/tenant-admin/${tenantAdminId}/users/${userId}`, userData as unknown as Record<string, unknown>);
  }

  /**
   * Delete (deactivate) a user
   * @param tenantAdminId - The tenant admin user ID
   * @param userId - The user ID to delete/deactivate
   */
  async deleteUser(tenantAdminId: number, userId: number): Promise<void> {
    return tenantAdminAuthApi.delete<void>(`/tenant-admin/${tenantAdminId}/users/${userId}`);
  }
}

// Singleton instance for easy use
export const tenantAdminService = new TenantAdminService();

