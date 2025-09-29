import React from 'react';
import { Shield, Zap, Globe } from 'lucide-react';

const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-[#0c272d]">Why Organizations Choose Flowmatic</h2>
            <p className="text-xl text-[#0c272d]/70">
              Built specifically for academic environments with enterprise-grade security and intuitive collaboration tools.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-[#14a67e]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-5 h-5 text-[#14a67e]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0c272d] mb-2">Seamless Integration</h3>
                  <p className="text-[#0c272d]/70">Connect with existing institutional systems through SSO/LDAP without disrupting current workflows.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-[#14a67e]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Globe className="w-5 h-5 text-[#14a67e]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0c272d] mb-2">Multi-Campus Support</h3>
                  <p className="text-[#0c272d]/70">Scale across multiple campuses and departments with centralized management and decentralized access.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-[#14a67e]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-5 h-5 text-[#14a67e]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0c272d] mb-2">Privacy & Compliance</h3>
                  <p className="text-[#0c272d]/70">FERPA compliant with advanced security features to protect sensitive academic information.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-[#9fdbc2]/20 to-[#14a67e]/10 rounded-3xl p-8">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0c272d]/70">User Satisfaction</span>
                  <span className="text-2xl font-bold text-[#14a67e]">98%</span>
                </div>
                <div className="w-full bg-[#9fdbc2]/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] h-2 rounded-full w-[98%]"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-[#0c272d]">500+</div>
                  <div className="text-sm text-[#0c272d]/70">Institutions</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-[#0c272d]">50K+</div>
                  <div className="text-sm text-[#0c272d]/70">Active Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;


