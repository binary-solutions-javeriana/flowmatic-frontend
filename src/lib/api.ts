import { config } from './config';

export const API_CONFIG = config.api;

// Flowmatic Backend Error Response Format
export interface ApiError {
  statusCode: number;
  message: string | string[];
  path: string;
  method: string;
  timestamp: string;
  requestId: string;
}

// Custom error class for API errors
export class ApiException extends Error {
  constructor(
    public statusCode: number,
    message: string | string[],
    public path: string,
    public method: string,
    public timestamp: string,
    public requestId: string
  ) {
    const errorMessage = Array.isArray(message) ? message.join(', ') : message;
    super(errorMessage);
    this.name = 'ApiException';
  }
}

// Enhanced API client with proper error handling
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_CONFIG.apiUrl}${path}`;
  
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  // Handle non-OK responses
  if (!response.ok) {
    let errorData: ApiError;
    
    try {
      errorData = await response.json();
    } catch {
      // Fallback if response isn't JSON
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

  // If no JSON content, return empty object
  return {} as T;
}

// Helper to add Authorization header
export function withAuth(token: string) {
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
}

// Health check endpoint (no version prefix)
export async function checkHealth(): Promise<{
  status: string;
  service: string;
  uptime: number;
  timestamp: string;
}> {
  const response = await fetch(config.api.healthUrl, {
    headers: {
      'Accept': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}
