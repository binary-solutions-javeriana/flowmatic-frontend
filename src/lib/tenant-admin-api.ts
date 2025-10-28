// Tenant Admin API client - Calls Java backend directly  
// Uses localhost:8080/api/v1 instead of the Next.js proxy

import { ApiException } from './api';
import { createAuthHeaders, isAuthenticated } from './auth-utils';

/**
 * Tenant Admin API client that calls Java backend directly at localhost:8080
 */
export async function tenantAdminApi<T>(
  path: string, 
  init?: RequestInit
): Promise<T> {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  const authHeaders = createAuthHeaders();
  // Direct call to Java backend on port 8080
  const url = `http://localhost:8080/api/v1${path}`;
  
  console.log(`[TenantAdminApi] ${init?.method || 'GET'} ${url}`, {
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

// Convenience methods for common HTTP verbs with tenant admin API
export const tenantAdminAuthApi = {
  async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return tenantAdminApi<T>(path, {
      method: 'GET',
      headers
    });
  },

  async post<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
    return tenantAdminApi<T>(path, {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers
    });
  },

  async put<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
    return tenantAdminApi<T>(path, {
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers
    });
  },

  async patch<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
    return tenantAdminApi<T>(path, {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers
    });
  },

  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return tenantAdminApi<T>(path, {
      method: 'DELETE',
      headers
    });
  }
};

