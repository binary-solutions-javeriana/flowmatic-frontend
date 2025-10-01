import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const CTA: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#9fdbc2]/10 to-[#14a67e]/10">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl font-bold text-[#0c272d]">Ready to Transform Your Institution&apos;s Project Management?</h2>
        <p className="text-xl text-[#0c272d]/70">
          Join hundreds of organizations already using Flowmatic to streamline their projects.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="group bg-[#14a67e] text-white px-10 py-4 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3">
            <span className="font-semibold text-lg">Start 30-Day Free Trial</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="bg-white/70 backdrop-blur-sm text-[#0c272d] px-10 py-4 rounded-xl hover:bg-white/90 transition-all duration-300 border border-[#9fdbc2]/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg">
            Schedule Demo
          </Link>
        </div>

        <div className="flex items-center justify-center space-x-8 pt-8">
          <div className="flex items-center space-x-2 text-[#0c272d]/70">
            <CheckCircle className="w-5 h-5 text-[#14a67e]" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center space-x-2 text-[#0c272d]/70">
            <CheckCircle className="w-5 h-5 text-[#14a67e]" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center space-x-2 text-[#0c272d]/70">
            <CheckCircle className="w-5 h-5 text-[#14a67e]" />
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;


