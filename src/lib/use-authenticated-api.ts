"use client";

// React hook for authenticated API calls
import { useCallback, useState } from 'react';
import { useAuth } from './auth-store';
import { authApi } from './authenticated-api';
import { isAuthenticated } from './auth-utils';

export function useAuthenticatedApi() {
  const { state } = useAuth();

  // Wrapper that checks auth state before making API calls
  const authenticatedCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options: { 
        redirectOnAuth?: boolean; 
        redirectPath?: string 
      } = {}
    ): Promise<T> => {
      const { redirectOnAuth = true, redirectPath = '/login' } = options;

      if (!state.isAuthenticated || !isAuthenticated()) {
        if (redirectOnAuth) {
          window.location.href = redirectPath;
        }
        throw new Error('Authentication required');
      }

      return apiCall();
    },
    [state.isAuthenticated]
  );

  // Convenience methods with auth checking
  const api = {
    async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
      return authenticatedCall(() => authApi.get<T>(path, headers));
    },

    async post<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
      return authenticatedCall(() => authApi.post<T>(path, body, headers));
    },

    async put<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
      return authenticatedCall(() => authApi.put<T>(path, body, headers));
    },

    async patch<T>(path: string, body?: string | Record<string, unknown> | Array<unknown>, headers?: Record<string, string>): Promise<T> {
      return authenticatedCall(() => authApi.patch<T>(path, body, headers));
    },

    async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
      return authenticatedCall(() => authApi.delete<T>(path, headers));
    }
  };

  return {
    api,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    authenticatedCall
  };
}

// Hook for making authenticated API calls with loading states
export function useAuthenticatedApiCall<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { api } = useAuthenticatedApi();

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options: { 
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
    } = {}
  ) => {
    const { onSuccess, onError } = options;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    clearError: () => setError(null)
  };
}
