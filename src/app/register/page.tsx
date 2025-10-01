"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-store";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  const { state } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!state.isLoading && state.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [state.isLoading, state.isAuthenticated, router]);

  // Show loading while checking authentication
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9fdbc2]/5 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e] mx-auto"></div>
          <p className="mt-4 text-[#0c272d]/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render register form if already authenticated (will redirect)
  if (state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/background_login/flowmatic_background.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center space-x-2 text-[#0c272d] hover:text-[#14a67e] transition-colors group pr-8"
      >
        <svg 
          className="w-6 h-6 transition-transform group-hover:scale-110" 
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back</span>
      </Link>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-0">
        <RegisterForm className="w-full" />
      </div>
    </div>
  );
}


