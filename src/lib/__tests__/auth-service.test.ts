import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpAuthService } from '../http-auth-service';
import { testData } from '../../test/test-utils';

// Mock fetch globally
global.fetch = vi.fn();

describe('HttpAuthService', () => {
  let authService: HttpAuthService;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    authService = new HttpAuthService();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData.loginResponse)
      });

      const result = await authService.login(testData.loginRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(testData.loginRequest)
        })
      );

      expect(result).toEqual({
        user: testData.user,
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 3600,
          tokenType: 'bearer'
        }
      });
    });

    it('should throw UnauthorizedError for invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(testData.apiError)
      });

      await expect(authService.login(testData.loginRequest))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw ValidationError for malformed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          ...testData.apiError,
          statusCode: 400,
          message: 'Invalid email format'
        })
      });

      await expect(authService.login(testData.loginRequest))
        .rejects
        .toThrow('Invalid email format');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.login(testData.loginRequest))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('register', () => {
    it('should successfully register with email confirmation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData.registerResponse)
      });

      const result = await authService.register(testData.registerRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(testData.registerRequest)
        })
      );

      expect(result).toEqual({
        user: testData.user,
        message: 'Registration successful. Please check your email to confirm your account.',
        requiresEmailConfirmation: true
      });
    });

    it('should successfully register with auto-confirm', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData.registerResponseWithTokens)
      });

      const result = await authService.register(testData.registerRequest);

      expect(result).toEqual({
        user: testData.user,
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 3600,
          tokenType: 'bearer'
        },
        message: 'Registration successful'
      });
    });

    it('should throw ConflictError for existing email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          ...testData.apiError,
          statusCode: 409,
          message: 'Email already registered'
        })
      });

      await expect(authService.register(testData.registerRequest))
        .rejects
        .toThrow('Email already registered');
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn()
        },
        writable: true
      });
    });

    it('should return true when valid token exists', async () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue('valid-token-with-sufficient-length');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
      expect(window.localStorage.getItem).toHaveBeenCalledWith('flowmatic_access_token');
    });

    it('should return false when no token exists', async () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when token is too short', async () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue('short');

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should resolve successfully', async () => {
      await expect(authService.logout()).resolves.toBeUndefined();
    });
  });

  describe('refreshTokens', () => {
    it('should throw not implemented error', async () => {
      await expect(authService.refreshTokens('refresh-token'))
        .rejects
        .toThrow('Token refresh not yet implemented');
    });
  });

  describe('getCurrentUser', () => {
    it('should throw not implemented error', async () => {
      await expect(authService.getCurrentUser())
        .rejects
        .toThrow('Get current user not yet implemented');
    });
  });
});
