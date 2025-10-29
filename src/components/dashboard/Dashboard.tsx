'use client';

import React, { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Overview from './Overview';
import ProjectsList from './ProjectsList';
import TasksOverview from './TasksOverview';
import Settings from './Settings';
import Notifications from './Notifications';
import type { SidebarItem } from './types';
import { useProjects } from '@/lib/projects';
import {
  FolderOpen,
  Home,
  Settings as SettingsIcon,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<string>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
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
      { id: 'settings', icon: SettingsIcon, label: 'Settings', active: activeView === 'settings' },
    ],
    [activeView]
  );

  const headerTitle = useMemo(() => {
    switch (activeView) {
      case 'overview': return 'Dashboard Overview';
      case 'projects': return 'Projects';
      case 'tasks': {
        const project = projects.find(p => p.proyect_id === selectedProjectId);
        return project ? `Tasks for ${project.name_proyect}` : 'Tasks';
      }
      case 'settings': return 'Settings & Preferences';
      case 'notifications': return 'Notifications';
      default: return activeView.charAt(0).toUpperCase() + activeView.slice(1);
    }
  }, [activeView, selectedProjectId, projects]);

  const handleViewTasks = (projectId: number) => {
    setSelectedProjectId(projectId);
    setActiveView('tasks');
  };
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white dark:from-gray-900 dark:to-gray-800 flex">
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
              Error: {error}
            </div>
          )}
          {!loading && !error && (
            <>
              {activeView === 'overview' && <Overview projects={projects} />}
              {activeView === 'projects' && <ProjectsList onViewTasks={handleViewTasks} />}
              {activeView === 'tasks' && <TasksOverview projectId={selectedProjectId} />}
              {activeView === 'settings' && <Settings />}
              {activeView === 'notifications' && <Notifications />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

