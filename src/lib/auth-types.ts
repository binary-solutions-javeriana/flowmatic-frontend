// Flowmatic Auth Types
// Supports both Supabase-like user shape and Backend-mapped user shape

export interface User {
  id: string;
  email: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
}

// Backend user shape returned by Flowmatic API
export interface BackendUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: number;
  auth_provider_id?: string;
  userType?: 'user' | 'tenantAdmin'; // Indicates which table the user is from
  isTenantAdmin?: boolean; // Flag to identify tenant admins
}

// API user can be either Supabase-like or Backend-like; normalize later
export type ApiUser = User | BackendUser;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "bearer";
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "bearer";
  user: ApiUser;
  userType?: 'user' | 'tenantAdmin'; // Indicates which table the user is from
  isTenantAdmin?: boolean; // Flag to identify tenant admins
}

export interface RegisterResponse {
  message: string;
  user: ApiUser;
}

export interface RegisterWithTokensResponse extends RegisterResponse, AuthTokens {}

// Union type to handle both register response variants
export type RegisterApiResponse = RegisterResponse | RegisterWithTokensResponse;

// Request DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// Helper type guards
export function hasTokens(response: RegisterApiResponse): response is RegisterWithTokensResponse {
  return 'access_token' in response;
}

export function requiresEmailConfirmation(response: RegisterApiResponse): response is RegisterResponse {
  return !hasTokens(response) && response.message.includes('check your email');
}
