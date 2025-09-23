"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from './http-auth-service';
import type { AuthService, AuthUser, AuthTokens, AuthResult } from './auth-service';

// Auth State
interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; tokens?: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Auth Context
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
interface AuthProviderProps {
  children: React.ReactNode;
  service?: AuthService;
}

export function AuthProvider({ children, service = authService }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'AUTH_LOADING', payload: true });
        
        const isAuth = await service.isAuthenticated();
        if (isAuth) {
          const user = await service.getCurrentUser();
          if (user) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user }
            });
          }
        }
      } catch (error) {
        // Silently handle initialization errors
        console.warn('Auth initialization failed:', error);
      } finally {
        dispatch({ type: 'AUTH_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, [service]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await service.login({ email, password });
      
      // Store tokens if provided
      if (result.tokens) {
        // Store in localStorage (in a real app, consider httpOnly cookies)
        localStorage.setItem('flowmatic_access_token', result.tokens.accessToken);
        localStorage.setItem('flowmatic_refresh_token', result.tokens.refreshToken);
        localStorage.setItem('flowmatic_user', JSON.stringify(result.user));
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: result.user, tokens: result.tokens }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await service.register({ email, password });
      
      // Store tokens if provided (auto-confirm case)
      if (result.tokens) {
        localStorage.setItem('flowmatic_access_token', result.tokens.accessToken);
        localStorage.setItem('flowmatic_refresh_token', result.tokens.refreshToken);
        localStorage.setItem('flowmatic_user', JSON.stringify(result.user));
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: result.user, tokens: result.tokens }
      });
      
      // Return the result so the component can handle different outcomes
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await service.logout();
      
      // Clear stored tokens
      localStorage.removeItem('flowmatic_access_token');
      localStorage.removeItem('flowmatic_refresh_token');
      localStorage.removeItem('flowmatic_user');
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if logout API fails
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_ERROR', payload: '' });
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for auth state only (useful for components that only need to read state)
export function useAuthState() {
  const { state } = useAuth();
  return state;
}
