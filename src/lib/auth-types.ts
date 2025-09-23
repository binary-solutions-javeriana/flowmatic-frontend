// Flowmatic Backend Auth Types
// Based on the API documentation provided

export interface User {
  id: string;
  email: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
}

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
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
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
