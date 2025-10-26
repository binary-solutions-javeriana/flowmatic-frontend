// Tenant Admin Service - API calls for tenant administrator operations

import { authApi } from './authenticated-api';
import type {
  TenantDashboardResponse,
  UserResponse,
  CreateUserRequest
} from './types/tenant-admin-types';

export class TenantAdminService {
  /**
   * Get tenant admin dashboard data including KPIs, tenant info, and recent projects
   * @param tenantAdminId - The tenant admin user ID
   */
  async getDashboardData(tenantAdminId: number): Promise<TenantDashboardResponse> {
    return authApi.get<TenantDashboardResponse>(`/tenant-admin/${tenantAdminId}/dashboard`);
  }

  /**
   * Get all users in the tenant
   * @param tenantAdminId - The tenant admin user ID
   */
  async getUsers(tenantAdminId: number): Promise<UserResponse[]> {
    return authApi.get<UserResponse[]>(`/tenant-admin/${tenantAdminId}/users`);
  }

  /**
   * Get a specific user by ID
   * @param tenantAdminId - The tenant admin user ID
   * @param userId - The user ID to fetch
   */
  async getUser(tenantAdminId: number, userId: number): Promise<UserResponse> {
    return authApi.get<UserResponse>(`/tenant-admin/${tenantAdminId}/users/${userId}`);
  }

  /**
   * Create a new user in the tenant
   * @param tenantAdminId - The tenant admin user ID
   * @param userData - The user data to create
   */
  async createUser(tenantAdminId: number, userData: CreateUserRequest): Promise<UserResponse> {
    return authApi.post<UserResponse>(`/tenant-admin/${tenantAdminId}/users`, userData);
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
    return authApi.put<UserResponse>(`/tenant-admin/${tenantAdminId}/users/${userId}`, userData);
  }

  /**
   * Delete (deactivate) a user
   * @param tenantAdminId - The tenant admin user ID
   * @param userId - The user ID to delete/deactivate
   */
  async deleteUser(tenantAdminId: number, userId: number): Promise<void> {
    return authApi.delete<void>(`/tenant-admin/${tenantAdminId}/users/${userId}`);
  }
}

// Singleton instance for easy use
export const tenantAdminService = new TenantAdminService();

