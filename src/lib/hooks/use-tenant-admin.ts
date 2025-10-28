import { useState, useEffect, useCallback } from 'react';
import { tenantAdminService } from '../tenant-admin-service';
import type {
  TenantDashboardResponse,
  UserResponse,
  CreateUserRequest
} from '../types/tenant-admin-types';

/**
 * Custom hook for tenant admin dashboard data
 */
export function useTenantAdminDashboard(tenantAdminId: number) {
  const [data, setData] = useState<TenantDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await tenantAdminService.getDashboardData(tenantAdminId);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [tenantAdminId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

/**
 * Custom hook for tenant users management
 */
export function useTenantUsers(tenantAdminId: number) {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await tenantAdminService.getUsers(tenantAdminId);
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [tenantAdminId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const createUser = useCallback(async (userData: CreateUserRequest) => {
    try {
      const newUser = await tenantAdminService.createUser(tenantAdminId, userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw err;
    }
  }, [tenantAdminId]);

  const updateUser = useCallback(async (userId: number, userData: CreateUserRequest) => {
    try {
      const updatedUser = await tenantAdminService.updateUser(tenantAdminId, userId, userData);
      setUsers(prev => prev.map(u => u.userId === userId ? updatedUser : u));
      return updatedUser;
    } catch (err) {
      throw err;
    }
  }, [tenantAdminId]);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      await tenantAdminService.deleteUser(tenantAdminId, userId);
      setUsers(prev => prev.filter(u => u.userId !== userId));
    } catch (err) {
      throw err;
    }
  }, [tenantAdminId]);

  return {
    users,
    loading,
    error,
    refresh: loadUsers,
    createUser,
    updateUser,
    deleteUser
  };
}

