'use client';

import React, { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Download,
  Settings as SettingsIcon,
  Zap,
  Save,
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      description: 'Manage your personal information and preferences'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Configure how and when you receive notifications'
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Password, two-factor authentication, and security settings'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of your workspace'
    },
    {
      id: 'project-preferences',
      title: 'Project Preferences',
      icon: SettingsIcon,
      description: 'Default settings for projects and task management'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Zap,
      description: 'Connect with external tools and services'
    },
    {
      id: 'data-export',
      title: 'Data & Export',
      icon: Download,
      description: 'Export your data and manage account information'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0c272d]">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#0c272d] mb-4">Settings</h3>
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 text-left ${
                    activeSection === section.id
                      ? 'bg-[#14a67e]/10 text-[#14a67e] border border-[#14a67e]/20'
                      : 'text-[#0c272d]/70 hover:bg-[#9fdbc2]/10 hover:text-[#0c272d]'
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
        <div className="lg:col-span-3 bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#0c272d]">{settingsSections.find(s => s.id === activeSection)?.title}</h3>
              <button className="bg-[#14a67e] text-white px-4 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
            
            <div className="bg-white/40 rounded-xl p-6 border border-[#9fdbc2]/10">
              <p className="text-[#0c272d]/60">
                Settings content for {settingsSections.find(s => s.id === activeSection)?.title} will be displayed here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

