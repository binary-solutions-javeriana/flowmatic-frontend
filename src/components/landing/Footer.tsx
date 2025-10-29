import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#4f5f66] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image src="/logo/flowmatic_logo.png" alt="Flowmatic Logo" className="w-8 h-8" width={32} height={32} priority />
              <span className="text-xl font-bold text-white">Flowmatic</span>
            </div>
            <p className="text-white/70">Streamlining project management for teams and organizations worldwide.</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Product</h4>
            <div className="space-y-2">
              <a href="#features" className="block text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="block text-white/70 hover:text-white transition-colors">Pricing</a>
              <a href="#security" className="block text-white/70 hover:text-white transition-colors">Security</a>
              <a href="#integrations" className="block text-white/70 hover:text-white transition-colors">Integrations</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Company</h4>
            <div className="space-y-2">
              <a href="#about" className="block text-white/70 hover:text-white transition-colors">About</a>
              <a href="#careers" className="block text-white/70 hover:text-white transition-colors">Careers</a>
              <a href="#press" className="block text-white/70 hover:text-white transition-colors">Press</a>
              <a href="#contact" className="block text-white/70 hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Support</h4>
            <div className="space-y-2">
              <a href="#help" className="block text-white/70 hover:text-white transition-colors">Help Center</a>
              <a href="#community" className="block text-white/70 hover:text-white transition-colors">Community</a>
              <a href="#api" className="block text-white/70 hover:text-white transition-colors">API Docs</a>
              <a href="#status" className="block text-white/70 hover:text-white transition-colors">Status</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70">© 2024 Flowmatic. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


