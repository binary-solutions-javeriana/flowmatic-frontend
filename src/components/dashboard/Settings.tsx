'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Palette,
  Moon,
  Sun,
} from 'lucide-react';
import { getStoredUser } from '@/lib/auth-redirect';
import { useDarkMode } from '@/lib/dark-mode-context';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface UserInfo {
  name: string;
  email: string;
  createdAt: string;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();


  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user data from localStorage
        const storedUser = getStoredUser();
        
        if (storedUser) {
          setUserInfo({
            name: storedUser.user_metadata?.name || storedUser.email?.split('@')[0] || 'User',
            email: storedUser.email || 'N/A',
            createdAt: new Date().toISOString().split('T')[0] // Default to today since we don't have creation date
          });
        } else {
          setError('Unable to load user information');
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      description: 'View your personal information'
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'View your security information'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel'
    }
  ];

  const renderContent = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
          <h3 className="font-semibold mb-2">Error Loading Settings</h3>
          <p>{error}</p>
        </div>
      );
    }

    // Show no data state
    if (!userInfo) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-yellow-700 dark:text-yellow-400">
          <p className="text-[#0c272d]/60 dark:text-gray-400">No profile information available</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-6 border border-[#9fdbc2]/10 dark:border-gray-700/50 space-y-4">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-[#0c272d]/70 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={userInfo.name}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#0c272d] dark:text-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-[#0c272d]/70 dark:text-gray-300 mb-2">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={userInfo.email}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#0c272d] dark:text-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="profile-createdAt" className="block text-sm font-medium text-[#0c272d]/70 dark:text-gray-300 mb-2">Member Since</label>
                <input
                  id="profile-createdAt"
                  type="text"
                  value={userInfo.createdAt}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#0c272d] dark:text-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-6 border border-[#9fdbc2]/10 dark:border-gray-700/50 space-y-4">
              <div>
                <label htmlFor="security-password" className="block text-sm font-medium text-[#0c272d]/70 dark:text-gray-300 mb-2">Current Password Status</label>
                <input
                  id="security-password"
                  type="text"
                  value="••••••••••••"
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#0c272d] dark:text-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-[#0c272d]/60 dark:text-gray-400 mt-1">Password information is read-only</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  For security reasons, password viewing and editing is currently disabled. Please contact system administrator to change your password.
                </p>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-6 border border-[#9fdbc2]/10 dark:border-gray-700/50 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-[#0c272d] dark:text-gray-100 mb-2">Theme</h4>
                <p className="text-sm text-[#0c272d]/60 dark:text-gray-400 mb-4">
                  Choose between light and dark mode
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-[#9fdbc2]/20 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-[#14a67e]/10'}`}>
                    {isDarkMode ? (
                      <Moon className="w-6 h-6 text-white" />
                    ) : (
                      <Sun className="w-6 h-6 text-[#14a67e]" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#0c272d] dark:text-gray-100">Dark Mode</p>
                    <p className="text-sm text-[#0c272d]/60 dark:text-gray-400">
                      {isDarkMode ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  aria-label="Toggle dark mode"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-[#14a67e]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#0c272d] dark:text-gray-100 mb-4">Settings</h3>
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 text-left ${
                    activeSection === section.id
                      ? 'bg-[#14a67e]/10 dark:bg-[#14a67e]/20 text-[#14a67e] dark:text-[#14a67e] border border-[#14a67e]/20 dark:border-[#14a67e]/30'
                      : 'text-[#0c272d]/70 dark:text-gray-400 hover:bg-[#9fdbc2]/10 dark:hover:bg-gray-700/50 hover:text-[#0c272d] dark:hover:text-gray-100'
                  }`}
                >
                  <section.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{section.title}</p>
                    <p className="text-xs opacity-70 truncate">{section.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 dark:border-gray-700/50">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#0c272d] dark:text-gray-100">
                {settingsSections.find(s => s.id === activeSection)?.title}
              </h3>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

