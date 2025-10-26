/**
 * Utility functions for role-based authentication redirects
 * Handles both regular Users (PROFESOR, ESTUDIANTE) and TenantAdmin
 */

export type UserRole = 'TenantAdmin' | 'PROFESOR' | 'ESTUDIANTE';
export type UserType = 'user' | 'tenantAdmin';

export interface StoredUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
    tenantId?: number;
    userType?: UserType;
    isTenantAdmin?: boolean;
  };
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedUser = localStorage.getItem('flowmatic_user');
    if (!storedUser) return null;
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
}

/**
 * Check if user is a tenant admin
 */
export function isTenantAdmin(user?: StoredUser | null): boolean {
  if (!user) {
    user = getStoredUser();
  }
  
  if (!user) {
    console.log('[isTenantAdmin] No user found');
    return false;
  }
  
  const isAdmin = user.user_metadata?.isTenantAdmin === true || 
                  user.user_metadata?.userType === 'tenantAdmin';
  
  console.log('[isTenantAdmin] Checking user:', {
    hasMetadata: !!user.user_metadata,
    isTenantAdmin: user.user_metadata?.isTenantAdmin,
    userType: user.user_metadata?.userType,
    result: isAdmin
  });
  
  return isAdmin;
}

/**
 * Get user role (TenantAdmin, PROFESOR, or ESTUDIANTE)
 */
export function getUserRole(user?: StoredUser | null): UserRole | null {
  if (!user) {
    user = getStoredUser();
  }
  
  if (!user) return null;
  
  // Check if tenant admin first
  if (isTenantAdmin(user)) {
    return 'TenantAdmin';
  }
  
  // Otherwise return the role from user metadata
  return (user.user_metadata?.role as UserRole) || null;
}

/**
 * Get the appropriate dashboard route based on user
 * 
 * @param user - The user object (optional, will be fetched if not provided)
 * @returns The path to redirect to
 */
export function getDashboardRoute(user?: StoredUser | null): string {
  if (!user) {
    user = getStoredUser();
  }
  
  if (!user) return '/login';
  
  // Tenant admins go to /tenant-admin
  if (isTenantAdmin(user)) {
    return '/tenant-admin';
  }
  
  // Regular users go to /dashboard
  return '/dashboard';
}

/**
 * Redirect user to appropriate dashboard based on their type
 * Call this after successful login
 * 
 * @param router - Next.js router instance
 * @param user - Optional user object (will be fetched if not provided)
 */
export function redirectToDashboard(
  router: { push: (path: string) => void },
  user?: StoredUser | null
): void {
  const dashboardRoute = getDashboardRoute(user);
  router.push(dashboardRoute);
}

/**
 * Check if user has required role
 * 
 * @param requiredRoles - Array of allowed roles
 * @param user - Optional user object (will be fetched if not provided)
 * @returns true if user has one of the required roles
 */
export function hasRequiredRole(
  requiredRoles: UserRole[],
  user?: StoredUser | null
): boolean {
  const userRole = getUserRole(user);
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get user ID as a number
 */
export function getUserId(user?: StoredUser | null): number | null {
  if (!user) {
    user = getStoredUser();
  }
  
  if (!user) return null;
  
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  return isNaN(userId as number) ? null : userId as number;
}

/**
 * Example usage in login flow:
 * 
 * ```typescript
 * import { redirectToDashboard, isTenantAdmin } from '@/lib/auth-redirect';
 * 
 * // After successful authentication
 * redirectToDashboard(router);
 * 
 * // Or check if user is admin
 * if (isTenantAdmin()) {
 *   // Do something for tenant admins
 * }
 * ```
 */

