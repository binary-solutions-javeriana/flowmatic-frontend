// Authenticated API client for protected routes
// Extends the base API client with automatic auth header injection

import { api } from './api';
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
  const headers = {
    ...authHeaders,
    ...(init?.headers || {})
  };

  return api<T>(path, {
    ...init,
    headers
  });
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
