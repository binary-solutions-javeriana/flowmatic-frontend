'use client';

import React, { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Overview from './Overview';
import ProjectsList from './ProjectsList';
import TasksOverview from './TasksOverview';
import Settings from './Settings';
import type { SidebarItem } from './types';
import { useProjects } from '@/lib/projects';
import {
  FolderOpen,
  Home,
  Settings as SettingsIcon,
  CheckSquare,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<string>('overview');
  const { projects, loading, error } = useProjects({ 
    page: 1, 
    limit: 100, 
    orderBy: 'created_at', 
    order: 'desc' 
  });

  const sidebarItems: SidebarItem[] = useMemo(
    () => [
      { id: 'overview', icon: Home, label: 'Overview', active: activeView === 'overview' },
      { id: 'projects', icon: FolderOpen, label: 'Projects', active: activeView === 'projects' },
      { id: 'tasks', icon: CheckSquare, label: 'Tasks', active: activeView === 'tasks' },
      { id: 'settings', icon: SettingsIcon, label: 'Settings', active: activeView === 'settings' },
    ],
    [activeView]
  );

  const headerTitle = useMemo(() => {
    switch (activeView) {
      case 'overview': return 'Dashboard Overview';
      case 'projects': return 'Projects';
      case 'tasks': return 'Task Management';
      case 'settings': return 'Settings & Preferences';
      default: return activeView.charAt(0).toUpperCase() + activeView.slice(1);
    }
  }, [activeView]);
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white flex">
      <Sidebar
        isOpen={sidebarOpen}
        items={sidebarItems}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onSelect={setActiveView}
      />

      <div className="flex-1 flex flex-col">
        <Header title={headerTitle} onNavigate={setActiveView} />
        <main className="flex-1 p-6 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              Error: {error}
            </div>
          )}
          {!loading && !error && (
            <>
              {activeView === 'overview' && <Overview projects={projects} />}
              {activeView === 'projects' && <ProjectsList />}
              {activeView === 'tasks' && <TasksOverview />}
              {activeView === 'settings' && <Settings />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

