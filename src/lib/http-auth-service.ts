// HttpAuthService - Concrete implementation of AuthService using HTTP
// Following SOLID principles: Single Responsibility (handles HTTP transport only)

import { api, ApiException } from './api';
import { config } from './config';
import type { AuthService, AuthResult, AuthTokens, AuthUser } from './auth-service';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterApiResponse,
  ApiUser
} from './auth-types';
import { hasTokens, requiresEmailConfirmation } from './auth-types';
import {
  AuthError,
  NetworkError,
  ValidationError,
  UnauthorizedError,
  ConflictError
} from './auth-service';

export class HttpAuthService implements AuthService {
  private readonly basePath = '/auth';

  async login(credentials: LoginRequest): Promise<AuthResult> {
    try {
      const url = 'http://localhost:3000/v1/auth/login';
      const requestBody = JSON.stringify(credentials);
      
      console.log(`[HttpAuthService] POST ${url}`, {
        url,
        body: requestBody,
        credentials: credentials
      });
      
      // Direct fetch call to bypass config and proxy
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBody,
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
            path: '/v1/auth/login',
            method: 'POST',
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

      const responseData = await response.json() as LoginResponse;

      return {
        user: this.mapUser(responseData.user),
        tokens: this.mapTokens(responseData)
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async register(credentials: RegisterRequest): Promise<AuthResult> {
    try {
      const url = 'http://localhost:3000/v1/auth/register';
      const requestBody = JSON.stringify(credentials);
      
      console.log(`[HttpAuthService] POST ${url}`, {
        url,
        body: requestBody,
        credentials: credentials
      });
      
      // Direct fetch call to bypass config and proxy
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBody,
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
            path: '/v1/auth/register',
            method: 'POST',
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

      const responseData = await response.json() as RegisterApiResponse;

      const result: AuthResult = {
        user: this.mapUser(responseData.user),
        message: responseData.message
      };

      // Check if registration includes tokens (auto-confirm) or requires email confirmation
      if (hasTokens(responseData)) {
        result.tokens = this.mapTokens(responseData);
      } else if (requiresEmailConfirmation(responseData)) {
        result.requiresEmailConfirmation = true;
      }

      return result;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async refreshTokens(): Promise<AuthTokens> {
    try {
      // Note: This endpoint isn't documented in the API spec yet
      // We'll implement it when the backend provides the endpoint
      throw new AuthError('Token refresh not yet implemented', 'NOT_IMPLEMENTED');
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async logout(): Promise<void> {
    // For now, logout is handled client-side by clearing stored tokens
    // In the future, this might call a backend logout endpoint
    return Promise.resolve();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Get stored token from localStorage
      const token = this.getStoredAccessToken();
      if (!token) {
        return null;
      }

      // Note: This endpoint isn't documented in the API spec yet
      // We'll implement it when the backend provides a /me or /profile endpoint
      throw new AuthError('Get current user not yet implemented', 'NOT_IMPLEMENTED');
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = this.getStoredAccessToken();
    if (!token) {
      return false;
    }

    // Basic token validation (check if it exists and isn't expired)
    // In a real app, you might want to decode the JWT and check expiration
    try {
      // For now, just check if token exists and has reasonable length
      return token.length > 20;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private mapUser(user: ApiUser): AuthUser {
    // If response already has Supabase-like shape, pass through safely
    if (
      (user as any).aud !== undefined ||
      (user as any).app_metadata !== undefined ||
      (user as any).user_metadata !== undefined
    ) {
      const u = user as unknown as {
        id: string;
        email: string;
        app_metadata?: Record<string, unknown>;
        user_metadata?: Record<string, unknown>;
        aud?: string;
      };
      return {
        id: u.id,
        email: u.email,
        app_metadata: u.app_metadata || {},
        user_metadata: u.user_metadata || {},
        aud: u.aud || 'authenticated'
      };
    }

    // Backend shape → normalize to our canonical AuthUser
    const backend = user as unknown as {
      id: string;
      email: string;
      name?: string;
      role?: string;
      tenantId?: number;
      auth_provider_id?: string;
    };

    const derivedName = backend.name || (backend.email ? backend.email.split('@')[0] : 'User');

    return {
      id: backend.id,
      email: backend.email,
      app_metadata: { provider: 'email' },
      user_metadata: {
        name: derivedName,
        role: backend.role,
        tenantId: backend.tenantId,
        auth_provider_id: backend.auth_provider_id
      },
      aud: 'authenticated'
    };
  }

  private mapTokens(response: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type?: 'bearer';
  }): AuthTokens {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tokenType: response.token_type || 'bearer'
    };
  }

  private mapError(error: unknown): AuthError {
    if (error instanceof ApiException) {
      switch (error.statusCode) {
        case 400:
          return new ValidationError(error.message, 'request');
        case 401:
          return new UnauthorizedError(error.message);
        case 409:
          return new ConflictError(error.message);
        default:
          return new AuthError(error.message, 'API_ERROR', error.statusCode);
      }
    }

    if (error instanceof Error) {
      // Network or other errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return new NetworkError(error.message);
      }
      return new AuthError(error.message, 'UNKNOWN_ERROR');
    }

    return new AuthError('An unexpected error occurred', 'UNKNOWN_ERROR');
  }

  private getStoredAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.accessTokenKey);
  }

  private setStoredTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(config.auth.accessTokenKey, tokens.accessToken);
    localStorage.setItem(config.auth.refreshTokenKey, tokens.refreshToken);
  }

  private clearStoredTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(config.auth.accessTokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.userKey);
  }
}

// Factory function to create AuthService instance
export function createAuthService(): AuthService {
  return new HttpAuthService();
}

// Singleton instance (optional - can be used for global state)
export const authService = createAuthService();
