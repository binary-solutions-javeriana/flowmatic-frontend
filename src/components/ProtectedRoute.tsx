"use client";

import React from 'react';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  fallback 
}: ProtectedRouteProps) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [state.isLoading, state.isAuthenticated, router, redirectTo]);

  // Show loading state while checking authentication
  if (state.isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!state.isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuthProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirectTo?: string; fallback?: React.ReactNode } = {}
) {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuthProtection(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for protecting routes programmatically
export function useAuthProtection(redirectTo: string = '/login') {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [state.isLoading, state.isAuthenticated, router, redirectTo]);

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user
  };
}
