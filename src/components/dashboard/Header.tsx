'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useAuthState, useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  onNavigate?: (view: string) => void;
  showSearch?: boolean;
  showProfileButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onNavigate, showSearch = false, showProfileButton = false }) => {
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
    
    // Check if there's a name in user_metadata
    if (user.user_metadata && typeof user.user_metadata === 'object') {
      const metadata = user.user_metadata as Record<string, unknown>;
      if (metadata.full_name) return String(metadata.full_name);
      if (metadata.name) return String(metadata.name);
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
    
    // Try to get initials from metadata name
    if (user.user_metadata && typeof user.user_metadata === 'object') {
      const metadata = user.user_metadata as Record<string, unknown>;
      const name = (metadata.full_name || metadata.name) as string | undefined;
      if (name) {
        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) {
          return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
      }
    }
    
    // Fall back to email initials
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  // Get user role from metadata
  const getUserRole = (): string => {
    if (!user || !user.user_metadata) return 'Usuario';

    const metadata = user.user_metadata as Record<string, unknown>;

    // Check if user is tenant admin
    if (metadata.isTenantAdmin === true || metadata.userType === 'tenantAdmin') {
      return 'Administrador';
    }

    // Check for role field
    if (metadata.role) {
      return String(metadata.role);
    }

    return 'Usuario';
  };

  // Get tenant information
  const getTenantInfo = (): string => {
    if (!user || !user.user_metadata) return '';

    const metadata = user.user_metadata as Record<string, unknown>;

    // Prefer tenantName if available, otherwise fall back to tenantId
    if (metadata.tenantName) {
      return String(metadata.tenantName);
    }

    if (metadata.tenantId) {
      return `Tenant: ${metadata.tenantId}`;
    }

    return '';
  };

  // Check if user is admin (TenantAdmin or SuperAdmin)
  const isAdmin = (): boolean => {
    if (!user || !user.user_metadata) return false;

    const metadata = user.user_metadata as Record<string, unknown>;

    // Check if user is tenant admin or has SuperAdmin role
    const isTenantAdmin = metadata.isTenantAdmin === true;
    const isUserTypeTenantAdmin = metadata.userType === 'tenantAdmin';
    const isSuperAdmin = metadata.role === 'SuperAdmin';

    const result = isTenantAdmin || isUserTypeTenantAdmin || isSuperAdmin;

    // Debug log
    console.log('[isAdmin] Check:', {
      isTenantAdmin,
      isUserTypeTenantAdmin,
      isSuperAdmin,
      role: metadata.role,
      userType: metadata.userType,
      result
    });

    return result;
  };

  const displayName = getUserDisplayName();
  const initials = getUserInitials();
  const userRole = getUserRole();
  const tenantInfo = getTenantInfo();
  const userIsAdmin = isAdmin();

  // Debug logs
  console.log('=== HEADER COMPONENT DEBUG ===');
  console.log('user object:', user);
  console.log('user.user_metadata:', user?.user_metadata);
  console.log('displayName:', displayName);
  console.log('userRole:', userRole);
  console.log('tenantInfo:', tenantInfo);
  console.log('userIsAdmin:', userIsAdmin);
  console.log('==============================');

  return (
    <header className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-b border-[#9fdbc2]/20 dark:border-gray-700/50 p-6 relative z-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100">{title}</h1>
          <p className="text-[#0c272d]/60 dark:text-gray-400">
            Welcome back, {displayName}
            <span className="ml-2 text-sm font-medium text-[#14a67e] dark:text-[#9fdbc2]">
              ({userRole})
            </span>
            {tenantInfo && (
              <span className="ml-2 text-xs text-[#0c272d]/50 dark:text-gray-500">
                {tenantInfo}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0c272d]/40 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#9fdbc2]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 focus:border-[#14a67e]/30 transition-all duration-300 text-[#0c272d] dark:text-gray-100"
              />
            </div>
          )}
          <button 
            onClick={() => onNavigate && onNavigate('notifications')}
            aria-label="Notifications"
            className="relative p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#9fdbc2]/30 dark:border-gray-600 hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all duration-300"
          >
            <Bell className="w-5 h-5 text-[#0c272d] dark:text-gray-100" />
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
              <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-[#9fdbc2]/20 dark:border-gray-700/50 shadow-xl overflow-hidden z-[9999]">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#9fdbc2]/20 dark:border-gray-700/50">
                  <p className="text-sm font-medium text-[#0c272d] dark:text-gray-100">{displayName}</p>
                  <p className="text-xs text-[#0c272d]/60 dark:text-gray-400 truncate">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {/* Settings - Only visible for admins */}
                  {userIsAdmin && (
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        if (onNavigate) {
                          onNavigate('settings');
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#0c272d]/70 dark:text-gray-300 hover:bg-[#9fdbc2]/10 dark:hover:bg-gray-700/50 hover:text-[#0c272d] dark:hover:text-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-[#9fdbc2]/20 dark:border-gray-700/50 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
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

