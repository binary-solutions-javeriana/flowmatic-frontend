import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle, Shield, Users } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#9fdbc2]/10 to-transparent"></div>
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-[#9fdbc2]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#9fdbc2]/30">
              <Shield className="w-4 h-4 text-[#14a67e]" />
              <span className="text-sm text-[#0c272d] font-medium">Secure Institutional Platform</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-[#0c272d] leading-tight">
              Streamline Your
              <span className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] bg-clip-text text-transparent"> Educational Projects</span>
            </h1>

            <p className="text-xl text-[#0c272d]/70 leading-relaxed max-w-lg">
              Comprehensive project management platform designed for educational institutions.
              Seamlessly integrate authentication, collaboration, and progress tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="group bg-[#14a67e] text-white px-8 py-4 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2">
                <span className="font-semibold">Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard" className="bg-white/50 backdrop-blur-sm text-[#0c272d] px-8 py-4 rounded-xl hover:bg-white/70 transition-all duration-300 border border-[#9fdbc2]/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Watch Demo
              </Link>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#14a67e]" />
                <span className="text-[#0c272d]/70">SSO/LDAP Integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#14a67e]" />
                <span className="text-[#0c272d]/70">Enterprise Ready</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-[#9fdbc2]/20">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#0c272d]">Project Dashboard</h3>
                  <div className="w-3 h-3 rounded-full bg-[#14a67e] animate-pulse"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#9fdbc2]/20">
                    <BookOpen className="w-8 h-8 text-[#14a67e] mb-2" />
                    <div className="text-2xl font-bold text-[#0c272d]">24</div>
                    <div className="text-sm text-[#0c272d]/60">Active Projects</div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#9fdbc2]/20">
                    <Users className="w-8 h-8 text-[#14a67e] mb-2" />
                    <div className="text-2xl font-bold text-[#0c272d]">156</div>
                    <div className="text-sm text-[#0c272d]/60">Team Members</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#0c272d]/70">Project Completion</span>
                    <span className="text-sm font-semibold text-[#14a67e]">78%</span>
                  </div>
                  <div className="w-full bg-[#9fdbc2]/20 rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] h-3 rounded-full w-3/4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


