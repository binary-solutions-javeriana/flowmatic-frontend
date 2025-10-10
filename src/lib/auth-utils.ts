// Auth utilities for protected routes and API calls
// Following SOLID principles: Single Responsibility for auth-related utilities

import { config } from './config';

// Get stored access token
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.auth.accessTokenKey);
}

// Get stored refresh token
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.auth.refreshTokenKey);
}

// Get stored user data
export function getStoredUser(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(config.auth.userKey);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Check if user is authenticated (has valid token)
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  // Consider authenticated if there is any non-empty token present.
  // Some environments issue short tokens; length checks can cause false negatives.
  return typeof token === 'string' && token.trim().length > 0;
}

// Clear all auth data
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(config.auth.accessTokenKey);
  localStorage.removeItem(config.auth.refreshTokenKey);
  localStorage.removeItem(config.auth.userKey);
}

// Create headers object with Authorization bearer token
export function createAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...additionalHeaders
  };
}

// Create fetch options with auth headers
export function createAuthFetchOptions(
  method: string = 'GET',
  body?: string | Record<string, unknown> | Array<unknown>,
  additionalHeaders: Record<string, string> = {}
): RequestInit {
  const headers = createAuthHeaders(additionalHeaders);
  
  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store'
  };

  if (body) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return options;
}

// Higher-order function to wrap API calls with auth
export function withAuth<TArgs extends unknown[], TResult>(
  apiFunction: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    if (!isAuthenticated()) {
      throw new Error('Authentication required');
    }
    return apiFunction(...args);
  };
}

// Utility to check if token is expired (basic JWT parsing)
export function isTokenExpired(token: string): boolean {
  try {
    // Basic JWT payload parsing (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    // If we can't parse the token, consider it expired
    return true;
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
}

// Get time until token expires (in seconds)
export function getTimeUntilExpiration(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  } catch {
    return 0;
  }
}

// Check if token needs refresh (expires within next 5 minutes)
export function needsTokenRefresh(token: string): boolean {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  return timeUntilExpiration < 300; // 5 minutes
}
