"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthenticatedApi } from "@/lib/use-authenticated-api";
import { useAuth } from "@/lib/auth-store";
import Link from "next/link";
import { type AuthTokens } from "@/lib/auth-service";

function getExpiresInMinutes(tokens: AuthTokens | { expires_in: number } | null): number | null {
  if (!tokens) return null;
  const seconds = 'expiresIn' in tokens ? tokens.expiresIn : tokens.expires_in;
  return Math.floor(seconds / 60);
}

function DashboardContent() {
  const { state } = useAuth();
  const { isAuthenticated } = useAuthenticatedApi();

  // Example of how to make authenticated API calls
  const handleTestApiCall = async () => {
    try {
      // This would call a protected endpoint when available
      // const profile = await api.get('/user/profile');
      console.log('Authenticated API call would work here');
      alert('Authenticated API call ready! (Backend endpoint not yet implemented)');
    } catch (error) {
      console.error('API call failed:', error);
      alert('API call failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome to your protected dashboard</p>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Home
            </Link>
          </div>

          {state.user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                User Information
              </h2>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Email:</strong> {state.user.email}</p>
                <p><strong>User ID:</strong> {state.user.id}</p>
                <p><strong>Name:</strong> {state.user.name}</p>
                <p><strong>Role:</strong> {state.user.role}</p>
                <p><strong>Tenant ID:</strong> {state.user.tenantId}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Authentication Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-gray-700">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
                </div>
                {state.tokens && (
                  <div className="text-xs text-gray-500">
                    Token expires in: {getExpiresInMinutes(state.tokens)} minutes
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                API Testing
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Test authenticated API calls with automatic token injection.
              </p>
              <button
                onClick={handleTestApiCall}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                Test API Call
              </button>
            </div>
          </div>

          {/* Projects Section */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              📋 Project Management
            </h3>
            <p className="text-sm text-green-800 mb-4">
              Access your projects and manage your workflow efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6h-3a1 1 0 100 2h3v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.707 7.293a1 1 0 00-1.414 1.414L7.586 16a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 13.172l-2.293-2.293z" clipRule="evenodd" />
                </svg>
                All Projects
              </Link>
              <Link
                href="/dashboard/projects/recent"
                className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white transition text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Recent Projects
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🔒 Protected Route Features
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatic authentication check</li>
              <li>• Redirects to login if not authenticated</li>
              <li>• Loading states during auth verification</li>
              <li>• Authenticated API calls with Bearer tokens</li>
              <li>• User information display</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
