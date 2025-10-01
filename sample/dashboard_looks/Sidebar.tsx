'use client';

import React from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import type { SidebarItem } from './types';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  items: SidebarItem[];
  onToggle: () => void;
  onSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, items, onToggle, onSelect }) => {
  const router = useRouter();

  const handleBackToLanding = () => {
    router.push('/');
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} transition-all duration-500 ease-in-out bg-white/60 backdrop-blur-lg border-r border-[#9fdbc2]/20 flex flex-col shadow-lg`}>
      <div className="h-[106px] flex items-center justify-center border-b border-[#9fdbc2]/20 transition-all duration-500 ease-in-out px-4">
        {isOpen ? (
          /* Open state - horizontal layout */
          <div className="w-full flex items-center justify-between">
            <div className={`flex items-center space-x-2 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              <img 
                src="/logo/flowmatic_logo.png" 
                alt="Flowmatic" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold text-[#0c272d] whitespace-nowrap">Flowmatic</span>
            </div>
            <button 
              onClick={onToggle} 
              className="p-2 rounded-lg hover:bg-[#9fdbc2]/10 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Menu className="w-5 h-5 text-[#0c272d] transition-transform duration-300" />
            </button>
          </div>
        ) : (
          /* Collapsed state - vertical layout */
          <div className="flex flex-col items-center space-y-2">
            <div className={`transition-all duration-500 ease-in-out ${!isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
              <img 
                src="/logo/flowmatic_logo.png" 
                alt="Flowmatic" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <button 
              onClick={onToggle} 
              className="p-2 rounded-lg hover:bg-[#9fdbc2]/10 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Menu className="w-5 h-5 text-[#0c272d] transition-transform duration-300 rotate-180" />
            </button>
          </div>
        )}
      </div>

      <nav className={`flex-1 ${isOpen ? 'p-4' : 'p-2'} space-y-2 overflow-hidden transition-all duration-500 ease-in-out`}>
        {items.map((item, index) => {
          const Icon = item.icon as React.ComponentType<{ className?: string }>;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center px-1'} py-2 rounded-xl transition-all duration-250 ease-in-out hover:scale-105 active:scale-95 ${
                item.active
                  ? 'bg-[#14a67e]/10 text-[#14a67e] border border-[#14a67e]/20 shadow-sm'
                  : 'text-[#0c272d]/70 hover:bg-[#9fdbc2]/10 hover:text-[#0c272d] hover:shadow-sm'
              }`}
              style={{
                transitionDelay: `${index * 25}ms`
              }}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-150 ${item.active ? 'scale-110' : 'scale-100'}`} />
              <span className={`font-medium whitespace-nowrap transition-all duration-250 ease-in-out ${
                isOpen 
                  ? 'opacity-100 translate-x-0 max-w-none' 
                  : 'opacity-0 translate-x-4 max-w-0 overflow-hidden'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[#9fdbc2]/20 transition-all duration-500 ease-in-out">
        <button
          onClick={handleBackToLanding}
          className={`w-full flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center px-1'} py-2 rounded-xl text-[#0c272d]/70 hover:bg-[#9fdbc2]/10 hover:text-[#0c272d] transition-all duration-500 ease-in-out hover:scale-105 active:scale-95 hover:shadow-sm`}
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0 transition-all duration-300" />
          <span className={`font-medium whitespace-nowrap transition-all duration-500 ease-in-out ${
            isOpen 
              ? 'opacity-100 translate-x-0 max-w-none' 
              : 'opacity-0 translate-x-4 max-w-0 overflow-hidden'
          }`}>
            Back to Landing
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

