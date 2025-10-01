"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-store";
import { type AuthTokens } from "@/lib/auth-service";

function getExpiresInMinutes(tokens: AuthTokens | { expires_in: number } | null): number | null {
  if (!tokens) return null;
  const seconds = 'expiresIn' in tokens ? tokens.expiresIn : tokens.expires_in;
  return Math.floor(seconds / 60);
}

export default function AuthSuccessPage() {
  const { state, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect will be handled by auth state change
  };

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      window.location.href = '/login';
    }
  }, [state.isLoading, state.isAuthenticated]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h1 className="text-2xl font-semibold text-green-900">Welcome to Flowmatic! 🎉</h1>
          
          {state.user && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Email:</strong> {state.user.email}</p>
                <p><strong>User ID:</strong> {state.user.id}</p>
                {state.tokens && (
                  <p className="mt-2 text-xs text-gray-500">
                    Token expires in: {getExpiresInMinutes(state.tokens)} minutes
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
            >
              Go to Home
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-red-800 hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


