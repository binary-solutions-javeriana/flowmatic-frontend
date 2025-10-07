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

  const getItem = vi.fn((key: string) => store[key] || null);
  const setItem = vi.fn((key: string, value: string) => {
    store[key] = value;
  });
  const removeItem = vi.fn((key: string) => {
    delete store[key];
  });
  const clear = vi.fn(() => {
    Object.keys(store).forEach(key => delete store[key]);
  });

  return { getItem, setItem, removeItem, clear };
}

// Mock fetch for API tests
export type MockFetchData = {
  ok?: boolean;
  status?: number;
  data?: unknown;
};

export function createMockFetch(responses: Record<string, unknown> = {}) {
  const mockFetch = vi.fn();
  
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    const responseKey = `${options?.method || 'GET'}:${url}`;
    const response = (responses as Record<string, MockFetchData | unknown>)[responseKey]
      || (responses as Record<string, MockFetchData | unknown>)[url]
      || (responses as Record<string, MockFetchData | unknown>)['default'];
    
    if (response) {
      const typed = response as MockFetchData | unknown;
      const ok = (typed as MockFetchData).ok;
      const status = (typed as MockFetchData).status;
      const data = (typed as MockFetchData).data ?? typed;
      return Promise.resolve({
        ok: ok !== false,
        status: status || 200,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data))
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
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn()
};

// Mock Next.js router
vi.mock('next/navigation', () => ({
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

// Helper to wait for async operations (avoid shadowing RTL's waitFor)
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
