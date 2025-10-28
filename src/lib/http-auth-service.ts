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

      // DEBUG: Log what backend returned
      console.log('=== BACKEND RESPONSE DEBUG ===');
      console.log('Full response:', responseData);
      console.log('userType from backend:', responseData.userType);
      console.log('isTenantAdmin from backend:', responseData.isTenantAdmin);
      console.log('user object from backend:', responseData.user);
      console.log('user.role from backend:', responseData.user?.role);
      console.log('user.rol from backend:', responseData.user?.rol);
      console.log('user.name from backend:', responseData.user?.name);
      console.log('user.email from backend:', responseData.user?.email);
      console.log('user.id from backend:', responseData.user?.id);
      console.log('==============================');

      // Map user and include userType/isTenantAdmin info
      const user = this.mapUser(responseData.user, responseData.userType, responseData.isTenantAdmin);

    console.log('=== MAPPED USER DEBUG ===');
    console.log('Mapped user:', user);
    console.log('user_metadata:', user.user_metadata);
    console.log('user_metadata.role:', user.user_metadata?.role);
    console.log('user_metadata.rol:', user.user_metadata?.rol);
    console.log('user_metadata.name:', user.user_metadata?.name);
    console.log('=========================');

      return {
        user,
        tokens: this.mapTokens(responseData)
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async register(credentials: RegisterRequest): Promise<AuthResult> {
    try {
      const url = 'http://10.43.103.86:3000/v1/auth/register';
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

  private mapUser(user: ApiUser, userType?: 'user' | 'tenantAdmin', isTenantAdmin?: boolean): AuthUser {
    // Extended user metadata shape
    interface ExtendedUserMetadata {
      isTenantAdmin?: boolean;
      userType?: 'user' | 'tenantAdmin';
      [key: string]: unknown;
    }

    interface ExtendedUser {
      id: string;
      email: string;
      app_metadata?: Record<string, unknown>;
      user_metadata?: ExtendedUserMetadata;
      aud?: string;
    }

    // If response already has Supabase-like shape, pass through safely
    const extendedUser = user as unknown as ExtendedUser;
    if (
      extendedUser.aud !== undefined ||
      extendedUser.app_metadata !== undefined ||
      extendedUser.user_metadata !== undefined
    ) {
      const u = extendedUser;
      
      console.log('[mapUser] User has metadata, processing...', {
        existingMetadata: u.user_metadata,
        topLevelUserType: userType,
        topLevelIsTenantAdmin: isTenantAdmin
      });
      
      // Merge metadata: prioritize values from user_metadata, then top-level params
      const existingIsTenantAdmin = u.user_metadata?.isTenantAdmin;
      const existingUserType = u.user_metadata?.userType;
      
      const finalIsTenantAdmin = existingIsTenantAdmin !== undefined 
        ? existingIsTenantAdmin 
        : (isTenantAdmin !== undefined ? isTenantAdmin : false);
        
      const finalUserType = existingUserType || userType || (finalIsTenantAdmin ? 'tenantAdmin' : 'user');
      
      // Add userType info to existing metadata
      const user_metadata = {
        ...(u.user_metadata || {}),
        userType: finalUserType,
        isTenantAdmin: finalIsTenantAdmin
      };
      
      console.log('[mapUser] Final metadata:', user_metadata);
      
      return {
        id: u.id,
        email: u.email,
        app_metadata: u.app_metadata || {},
        user_metadata,
        aud: u.aud || 'authenticated'
      };
    }

    // Backend shape → normalize to our canonical AuthUser
    const backend = user as unknown as {
      id: string;
      email: string;
      name?: string;
      role?: string;
      rol?: string; // Database field name
      tenantId?: number;
      auth_provider_id?: string;
      userType?: 'user' | 'tenantAdmin';
      isTenantAdmin?: boolean;
    };

    // Debug logging for backend user processing
    console.log('=== mapUser BACKEND DEBUG ===');
    console.log('backend user:', backend);
    console.log('backend.role:', backend.role);
    console.log('backend.rol:', backend.rol);
    console.log('userType param:', userType);
    console.log('isTenantAdmin param:', isTenantAdmin);
    console.log('==============================');

    const derivedName = backend.name || (backend.email ? backend.email.split('@')[0] : 'User');
    
    // Determine if user is tenant admin from multiple sources
    const isAdmin = isTenantAdmin ?? backend.isTenantAdmin ?? (userType === 'tenantAdmin') ?? (backend.userType === 'tenantAdmin');

    // Use rol field if role is not available (database field name)
    // Also check userType as fallback since backend might return userType instead of role
    const userRole = backend.role || backend.rol || backend.userType || userType;
    
    console.log('=== mapUser ROLE PROCESSING ===');
    console.log('backend.role:', backend.role);
    console.log('backend.rol:', backend.rol);
    console.log('backend.userType:', backend.userType);
    console.log('Final userRole:', userRole);
    console.log('derivedName:', derivedName);
    console.log('================================');

    const mappedUser = {
      id: backend.id,
      email: backend.email,
      app_metadata: { provider: 'email' },
      user_metadata: {
        name: derivedName,
        role: userRole,
        tenantId: backend.tenantId,
        auth_provider_id: backend.auth_provider_id,
        userType: userType || backend.userType || (isAdmin ? 'tenantAdmin' : 'user'),
        isTenantAdmin: isAdmin
      },
      aud: 'authenticated'
    };

    console.log('=== mapUser RESULT DEBUG ===');
    console.log('mapped user:', mappedUser);
    console.log('mapped user_metadata:', mappedUser.user_metadata);
    console.log('============================');

    return mappedUser;
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
