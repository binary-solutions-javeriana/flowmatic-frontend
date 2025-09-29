'use client';

import React from 'react';
import Link from 'next/link';

const Nav: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo/flowmatic_logo.png" 
              alt="Flowmatic" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-[#0c272d]">Flowmatic</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#about" className="text-[#0c272d] hover:text-[#14a67e] transition-colors">About</a>
            <a href="#features" className="text-[#0c272d] hover:text-[#14a67e] transition-colors">Features</a>
            <a href="#benefits" className="text-[#0c272d] hover:text-[#14a67e] transition-colors">Benefits</a>
            <a href="#pricing" className="text-[#0c272d] hover:text-[#14a67e] transition-colors">Pricing</a>
            <a href="#contact" className="text-[#0c272d] hover:text-[#14a67e] transition-colors">Contact</a>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="bg-transparent text-[#0c272d] px-6 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 border border-[#0c272d]/20 hover:border-[#14a67e]/40"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="bg-white/30 backdrop-blur-sm text-[#0c272d] px-6 py-2 rounded-xl hover:bg-white/50 transition-all duration-300 border border-[#9fdbc2]/30 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Support Application
            </Link>
            <Link
              href="/dashboard"
              className="bg-white/50 backdrop-blur-sm text-[#0c272d] px-6 py-2 rounded-xl hover:bg-white/70 transition-all duration-300 border border-[#9fdbc2]/30 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Show Demo
            </Link>
            <Link
              href="/register"
              className="bg-[#14a67e] text-white px-6 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;


