"use client";

import React from "react";
import Link from "next/link";
import StyledLoginForm from "./LoginForm";

export default function Login() {
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
        <StyledLoginForm />
      </div>
    </div>
  );
}


