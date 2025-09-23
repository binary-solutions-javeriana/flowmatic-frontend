// Test utilities for React Testing Library
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth-store';

// Custom render function that includes providers
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Mock localStorage for tests
export function createMockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    }
  };
}

// Mock fetch for API tests
export function createMockFetch(responses: Record<string, any> = {}) {
  const mockFetch = jest.fn();
  
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    const responseKey = `${options?.method || 'GET'}:${url}`;
    const response = responses[responseKey] || responses[url] || responses['default'];
    
    if (response) {
      return Promise.resolve({
        ok: response.ok !== false,
        status: response.status || 200,
        json: () => Promise.resolve(response.data || response),
        text: () => Promise.resolve(JSON.stringify(response.data || response))
      });
    }
    
    // Default 404 response
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' })
    });
  });
  
  return mockFetch;
}

// Mock router for navigation tests
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn()
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams()
}));

// Test data factories
export const testData = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated'
  },
  
  tokens: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer' as const
  },
  
  loginRequest: {
    email: 'test@example.com',
    password: 'password123'
  },
  
  registerRequest: {
    email: 'test@example.com',
    password: 'password123'
  },
  
  loginResponse: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer' as const,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    }
  },
  
  registerResponse: {
    message: 'Registration successful. Please check your email to confirm your account.',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    }
  },
  
  registerResponseWithTokens: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer' as const,
    message: 'Registration successful',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    }
  },
  
  apiError: {
    statusCode: 401,
    message: 'Invalid credentials',
    path: '/v1/auth/login',
    method: 'POST',
    timestamp: '2023-01-01T00:00:00.000Z',
    requestId: 'test-request-id'
  }
};

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
