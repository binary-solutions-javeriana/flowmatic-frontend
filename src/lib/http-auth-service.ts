// HttpAuthService - Concrete implementation of AuthService using HTTP
// Following SOLID principles: Single Responsibility (handles HTTP transport only)

import { api, ApiException } from './api';
import { config } from './config';
import type { AuthService, AuthResult, AuthTokens, AuthUser } from './auth-service';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterApiResponse
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
      const response = await api<LoginResponse>(`${this.basePath}/login`, {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      return {
        user: this.mapUser(response.user),
        tokens: this.mapTokens(response)
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async register(credentials: RegisterRequest): Promise<AuthResult> {
    try {
      const response = await api<RegisterApiResponse>(`${this.basePath}/register`, {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      const result: AuthResult = {
        user: this.mapUser(response.user),
        message: response.message
      };

      // Check if registration includes tokens (auto-confirm) or requires email confirmation
      if (hasTokens(response)) {
        result.tokens = this.mapTokens(response);
      } else if (requiresEmailConfirmation(response)) {
        result.requiresEmailConfirmation = true;
      }

      return result;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async refreshTokens(_refreshToken: string): Promise<AuthTokens> {
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

  private mapUser(user: {
    id: string;
    email: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
    aud: string;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      app_metadata: user.app_metadata || {},
      user_metadata: user.user_metadata || {},
      aud: user.aud
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
