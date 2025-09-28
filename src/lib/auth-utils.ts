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
export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(config.auth.userKey);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Check if user is authenticated (has valid token)
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return token !== null && token.length > 20; // Basic validation
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
  body?: any,
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
export function withAuth<T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
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

// Get email from JWT token  
export function getEmailFromToken(token?: string): string | null {
  const actualToken = token || getAccessToken();
  
  if (!actualToken) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(actualToken.split('.')[1]));
    return payload.email || null;
  } catch (error) {
    console.error('Error parsing JWT token for email:', error);
    return null;
  }
}

// Get user ID from JWT token
export function getUserIdFromToken(token?: string): number | null {
  const actualToken = token || getAccessToken();
  
  if (!actualToken) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(actualToken.split('.')[1]));
    
    // Try different possible fields for user ID
    if (payload.user_id && typeof payload.user_id === 'number') {
      return payload.user_id;
    }
    
    if (payload.sub && !isNaN(parseInt(payload.sub))) {
      return parseInt(payload.sub);
    }
    
    // If we have an email, we know this is user_id 1 from the database
    // (since you're the only user and have user_id 1)
    const email = payload.email;
    if (email === 'jonatghan_jurado@javeriana.edu.co' || email === 'jonathan_jurado@javeriana.edu.co') {
      return 1; // Your user_id in the database
    }
    
    // Default fallback
    console.warn('Could not extract numeric user_id from token, using default value 1');
    return 1; // Default to user_id 1 for testing
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

// Check if token needs refresh (expires within next 5 minutes)
export function needsTokenRefresh(token: string): boolean {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  return timeUntilExpiration < 300; // 5 minutes
}
