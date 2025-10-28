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
  
  if (!user) {
    console.log('=== getUserRole DEBUG ===');
    console.log('No user found');
    console.log('========================');
    return null;
  }
  
  // Debug logging
  console.log('=== getUserRole DEBUG ===');
  console.log('user:', user);
  console.log('user.user_metadata:', user.user_metadata);
  console.log('user.user_metadata?.role:', user.user_metadata?.role);
  console.log('user.user_metadata?.role type:', typeof user.user_metadata?.role);
  console.log('isTenantAdmin(user):', isTenantAdmin(user));
  console.log('========================');
  
  // Check if tenant admin first
  if (isTenantAdmin(user)) {
    console.log('User is TenantAdmin');
    return 'TenantAdmin';
  }
  
  // Otherwise return the role from user metadata
  const role = user.user_metadata?.role as UserRole;
  console.log('Extracted role from metadata:', role);
  
  // Validate that the role is one of the expected values (case insensitive)
  const roleStr = String(role).toLowerCase();
  if (roleStr && ['profesor', 'professor', 'estudiante', 'student'].includes(roleStr)) {
    console.log('Valid role found:', roleStr);
    // Convert to uppercase enum values for consistency
    const normalizedRole = roleStr === 'professor' ? 'PROFESOR' : 
                          roleStr === 'student' ? 'ESTUDIANTE' : 
                          roleStr.toUpperCase();
    return normalizedRole as UserRole;
  }
  
  console.log('No valid role found, returning null');
  return null;
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
 * Map database role to user-friendly display name
 */
export function mapRoleToDisplayName(role: UserRole | null): string {
  console.log('=== mapRoleToDisplayName DEBUG ===');
  console.log('Input role:', role);
  console.log('Role type:', typeof role);
  
  // Handle both database values and enum values
  if (!role) {
    console.log('Mapped to: User (default)');
    return 'User';
  }
  
  const roleStr = String(role).toLowerCase();
  
  switch (roleStr) {
    case 'profesor':
    case 'professor':
      console.log('Mapped to: Professor');
      return 'Professor';
    case 'estudiante':
    case 'student':
      console.log('Mapped to: Student');
      return 'Student';
    case 'tenantadmin':
      console.log('Mapped to: Tenant Admin');
      return 'Tenant Admin';
    default:
      console.log('Mapped to: User (default)');
      return 'User';
  }
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

