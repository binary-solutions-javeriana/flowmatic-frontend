'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Role-based route protection component
 * 
 * Usage:
 * <RoleBasedRoute allowedRoles={['TenantAdmin']}>
 *   <TenantAdminDashboard />
 * </RoleBasedRoute>
 */

export type UserRole = 'TenantAdmin' | 'PROFESOR' | 'ESTUDIANTE';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles,
  fallbackPath = '/unauthorized'
}) => {
  const router = useRouter();
  
  const getUserRole = (): UserRole | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('flowmatic_user');
      if (!storedUser) return null;
      
      const userData = JSON.parse(storedUser);
      
      // Check if user is tenant admin
      const isTenantAdmin = userData?.user_metadata?.isTenantAdmin || 
                           userData?.user_metadata?.userType === 'tenantAdmin';
      
      if (isTenantAdmin) {
        return 'TenantAdmin';
      }
      
      // Otherwise, get role from user metadata
      const role = userData?.user_metadata?.role;
      return role as UserRole || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  };

  const userRole = getUserRole();

  // If no user role (not logged in), redirect to login
  if (!userRole) {
    router.push('/login');
    return null;
  }

  // If user role is not in allowed roles, redirect to fallback
  if (!allowedRoles.includes(userRole)) {
    router.push(fallbackPath);
    return null;
  }

  // User has correct role, render children
  return <>{children}</>;
};

export default RoleBasedRoute;

