'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useAuthState, useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuthState();
  const { logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Extract user display name from email or metadata
  const getUserDisplayName = (): string => {
    if (!user) return 'User';
    
    // Check if there's a name field (new backend structure)
    if (user.name) {
      return user.name;
    }
    
    // Fall back to email username (part before @)
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      // Capitalize first letter
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }
    
    return 'User';
  };

  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!user) return 'U';
    
    // Try to get initials from name field
    if (user.name) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    
    // Fall back to email initials
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  const displayName = getUserDisplayName();
  const initials = getUserInitials();

  return (
    <header className="bg-white/60 backdrop-blur-lg border-b border-[#9fdbc2]/20 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0c272d]">{title}</h1>
          <p className="text-[#0c272d]/60">Welcome back, {displayName}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0c272d]/40" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-[#9fdbc2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 focus:border-[#14a67e]/30 transition-all duration-300"
            />
          </div>
          <button className="relative p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-[#9fdbc2]/30 hover:bg-white/70 transition-all duration-300">
            <Bell className="w-5 h-5 text-[#0c272d]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
          
          {/* User Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <span className="text-sm font-medium text-white">{initials}</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl border border-[#9fdbc2]/20 shadow-xl overflow-hidden z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#9fdbc2]/20">
                  <p className="text-sm font-medium text-[#0c272d]">{displayName}</p>
                  <p className="text-xs text-[#0c272d]/60 truncate">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to profile settings
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#0c272d]/70 hover:bg-[#9fdbc2]/10 hover:text-[#0c272d] transition-colors flex items-center space-x-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to settings
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#0c272d]/70 hover:bg-[#9fdbc2]/10 hover:text-[#0c272d] transition-colors flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-[#9fdbc2]/20 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

