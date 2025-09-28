"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-store";

export default function Home() {
  const { state, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Flowmatic
        </h1>
        
        {state.isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : state.isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900">
                You&apos;re logged in! 🎉
              </h2>
              <p className="text-green-700">
                Welcome back, {state.user?.email}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/auth/success"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                View Account
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-gray-600 mb-6">
              Get started with Flowmatic by creating an account or logging in.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
        
        <div className="mt-12 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">API Status</h3>
          <div className="text-xs text-gray-600">
            Backend: <code>http://localhost:3000</code>
          </div>
        </div>
      </div>
    </div>
  );
}
