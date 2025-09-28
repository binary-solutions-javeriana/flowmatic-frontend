"use client";

import React from "react";
import Link from "next/link";

export default function EmailConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="mb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-blue-900 mb-2">
            Check Your Email
          </h1>
          
          <p className="text-blue-800 mb-6">
            We&apos;ve sent you a confirmation link. Please check your email and click the link to activate your account.
          </p>
          
          <div className="space-y-4">
            <div className="text-sm text-blue-700">
              <p>Didn&apos;t receive the email?</p>
              <ul className="mt-2 text-xs space-y-1">
                <li>• Check your spam folder</li>
                <li>• Make sure you entered the correct email address</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Go to Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 border border-blue-300 bg-white text-blue-800 rounded-md hover:bg-blue-50 transition"
              >
                Try Different Email
              </Link>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
