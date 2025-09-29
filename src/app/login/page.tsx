"use client";

import React from "react";
import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
        
        <LoginForm className="w-full" />
        
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}


