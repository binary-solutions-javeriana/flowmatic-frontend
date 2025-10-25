// Authenticated API client for protected routes
// Direct localhost:3000 calls to bypass proxy system

import { ApiException } from './api';
import { createAuthHeaders, isAuthenticated } from './auth-utils';

// Authenticated API client that automatically adds auth headers
export async function authenticatedApi<T>(
  path: string, 
  init?: RequestInit
): Promise<T> {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  const authHeaders = createAuthHeaders();
  const url = `http://localhost:3000/v1${path}`;
  
  console.log(`[AuthenticatedApi] ${init?.method || 'GET'} ${url}`, {
    url,
    path,
    method: init?.method || 'GET',
    headers: authHeaders
  });

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders,
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        statusCode: response.status,
        message: `HTTP ${response.status}: ${response.statusText}`,
        path: path,
        method: init?.method || 'GET',
        timestamp: new Date().toISOString(),
        requestId: 'unknown'
      };
    }
    throw new ApiException(
      errorData.statusCode,
      errorData.message,
      errorData.path,
      errorData.method,
      errorData.timestamp,
      errorData.requestId
    );
  }

  // Handle responses without content (like 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  // Check if response has JSON content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  // If content is not JSON, throw to surface the real upstream response type
  throw new Error(`Unexpected content-type from API: ${contentType || 'none'}`);
}

// Convenience methods for common HTTP verbs with auth
export const authApi = {
  async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return authenticatedApi<T>(path, {
      method: 'GET',
      headers
    });
  },

  async post<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
    return authenticatedApi<T>(path, {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers
    });
  },

  async put<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
    return authenticatedApi<T>(path, {
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers
    });
  },

  async patch<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
    return authenticatedApi<T>(path, {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers
    });
  },

  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return authenticatedApi<T>(path, {
      method: 'DELETE',
      headers
    });
  }
};

// Example usage for future protected endpoints
export class ProtectedApiService {
  // Example: Get user profile
  async getUserProfile() {
    return authApi.get('/user/profile');
  }

  // Example: Update user profile
  async updateUserProfile(profileData: Record<string, unknown>) {
    return authApi.put('/user/profile', profileData);
  }

  // Example: Get user settings
  async getUserSettings() {
    return authApi.get('/user/settings');
  }

  // Example: Update user settings
  async updateUserSettings(settings: Record<string, unknown>) {
    return authApi.patch('/user/settings', settings);
  }

  // Example: Delete user account
  async deleteAccount() {
    return authApi.delete('/user/account');
  }
}

// Singleton instance for easy use
export const protectedApi = new ProtectedApiService();
