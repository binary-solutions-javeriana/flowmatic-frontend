import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createMockLocalStorage, testData } from '@/test/test-utils';

// hoisted mock definitions must be declared using vi.hoisted for use inside vi.mock
const { mockLogin, mockRegister, mockLogout, mockIsAuthenticated, mockGetCurrentUser } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRegister: vi.fn(),
  mockLogout: vi.fn(),
  mockIsAuthenticated: vi.fn(),
  mockGetCurrentUser: vi.fn(),
}));

vi.mock('../http-auth-service', () => ({
  HttpAuthService: vi.fn().mockImplementation(() => ({
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    isAuthenticated: mockIsAuthenticated,
    getCurrentUser: mockGetCurrentUser,
    refreshTokens: vi.fn(),
  })),
  authService: {
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    isAuthenticated: mockIsAuthenticated,
    getCurrentUser: mockGetCurrentUser,
    refreshTokens: vi.fn(),
  }
}));

import { AuthProvider, useAuth } from '../auth-store';

// Mock the HttpAuthService

describe('AuthStore', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    vi.clearAllMocks();
    mockIsAuthenticated.mockResolvedValue(false);
    mockGetCurrentUser.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderAuthHook = () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    return renderHook(() => useAuth(), { wrapper });
  };

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderAuthHook();

      expect(result.current.state.isLoading).toBe(true);
      expect(result.current.state.isAuthenticated).toBe(false);
      expect(result.current.state.user).toBeNull();
      expect(result.current.state.error).toBeNull();
    });

    it('should check authentication status on mount', async () => {
      mockIsAuthenticated.mockResolvedValue(true);
      mockGetCurrentUser.mockResolvedValue(testData.user);

      const { result } = renderAuthHook();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockIsAuthenticated).toHaveBeenCalled();
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should successfully login and update state', async () => {
      mockLogin.mockResolvedValue({
        user: testData.user,
        tokens: testData.tokens
      });

      const { result } = renderAuthHook();

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });

      expect(result.current.state.isAuthenticated).toBe(true);
      expect(result.current.state.user).toEqual(testData.user);
      expect(result.current.state.tokens).toEqual(testData.tokens);
      expect(result.current.state.error).toBeNull();
    });

    it('should handle login errors', async () => {
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValue(new Error(errorMessage));

      const { result } = renderAuthHook();

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.state.isAuthenticated).toBe(false);
      expect(result.current.state.error).toBe(errorMessage);
    });

    it('should store tokens in localStorage on successful login', async () => {
      mockLogin.mockResolvedValue({
        user: testData.user,
        tokens: testData.tokens
      });

      const { result } = renderAuthHook();

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'flowmatic_access_token',
        testData.tokens.access_token
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'flowmatic_refresh_token',
        testData.tokens.refresh_token
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'flowmatic_user',
        JSON.stringify(testData.user)
      );
    });
  });

  describe('register', () => {
    it('should successfully register and update state', async () => {
      mockRegister.mockResolvedValue({
        user: testData.user,
        tokens: testData.tokens
      });

      const { result } = renderAuthHook();

      await act(async () => {
        const registerResult = await result.current.register('test@example.com', 'password');
        expect(registerResult).toEqual({
          user: testData.user,
          tokens: testData.tokens
        });
      });

      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });

      expect(result.current.state.isAuthenticated).toBe(true);
      expect(result.current.state.user).toEqual(testData.user);
      expect(result.current.state.tokens).toEqual(testData.tokens);
    });

    it('should handle registration with email confirmation', async () => {
      mockRegister.mockResolvedValue({
        user: testData.user,
        requiresEmailConfirmation: true,
        message: 'Please check your email'
      });

      const { result } = renderAuthHook();

      await act(async () => {
        const registerResult = await result.current.register('test@example.com', 'password');
        expect(registerResult.requiresEmailConfirmation).toBe(true);
      });

      expect(result.current.state.isAuthenticated).toBe(true);
      expect(result.current.state.user).toEqual(testData.user);
      expect(result.current.state.tokens).toBeNull();
    });

    it('should handle registration errors', async () => {
      const errorMessage = 'Email already exists';
      mockRegister.mockRejectedValue(new Error(errorMessage));

      const { result } = renderAuthHook();

      await act(async () => {
        try {
          await result.current.register('existing@example.com', 'password');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.state.isAuthenticated).toBe(false);
      expect(result.current.state.error).toBe(errorMessage);
    });
  });

  describe('logout', () => {
    it('should clear state and localStorage on logout', async () => {
      mockLogout.mockResolvedValue(undefined);

      const { result } = renderAuthHook();

      // First login
      mockLogin.mockResolvedValue({
        user: testData.user,
        tokens: testData.tokens
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(result.current.state.isAuthenticated).toBe(false);
      expect(result.current.state.user).toBeNull();
      expect(result.current.state.tokens).toBeNull();
      expect(result.current.state.error).toBeNull();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flowmatic_access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flowmatic_refresh_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flowmatic_user');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockLogin.mockRejectedValue(new Error('Test error'));

      const { result } = renderAuthHook();

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'password');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.state.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.state.error).toBeNull();
    });
  });
});
