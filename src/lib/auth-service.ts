// AuthService Interface - Defines the contract for authentication operations
// Following SOLID principles: Interface Segregation and Dependency Inversion

import type {
  LoginRequest,
  RegisterRequest,
  User
} from './auth-types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'bearer';
}

export type AuthUser = User;

export interface AuthResult {
  user: AuthUser;
  tokens?: AuthTokens;
  requiresEmailConfirmation?: boolean;
  message?: string;
}

export interface AuthService {
  /**
   * Authenticate user with email and password
   * @param credentials Login credentials
   * @returns Promise resolving to auth result with user and tokens
   */
  login(credentials: LoginRequest): Promise<AuthResult>;

  /**
   * Register new user with email and password
   * @param credentials Registration credentials
   * @returns Promise resolving to auth result (may require email confirmation)
   */
  register(credentials: RegisterRequest): Promise<AuthResult>;

  /**
   * Refresh authentication tokens
   * @param refreshToken Current refresh token
   * @returns Promise resolving to new auth tokens
   */
  refreshTokens(refreshToken: string): Promise<AuthTokens>;

  /**
   * Logout user (clear tokens, etc.)
   * @returns Promise resolving when logout is complete
   */
  logout(): Promise<void>;

  /**
   * Get current authenticated user
   * @returns Promise resolving to current user or null if not authenticated
   */
  getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Check if user is currently authenticated
   * @returns Promise resolving to authentication status
   */
  isAuthenticated(): Promise<boolean>;
}

// Auth errors
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends AuthError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

export class ValidationError extends AuthError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ConflictError extends AuthError {
  constructor(message: string = 'Resource already exists') {
    super(message, 'CONFLICT', 409);
  }
}
