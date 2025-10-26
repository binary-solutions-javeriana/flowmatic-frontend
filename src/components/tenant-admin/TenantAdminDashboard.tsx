'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import TenantInfo from './TenantInfo';
import TenantKPIs from './TenantKPIs';
import UserManagement from './UserManagement';
import TenantProjects from './TenantProjects';
import type { SidebarItem } from '../dashboard/types';
import type { TenantDashboardResponse } from '@/lib/types/tenant-admin-types';
import { tenantAdminService } from '@/lib/tenant-admin-service';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Settings as SettingsIcon,
} from 'lucide-react';

interface TenantAdminDashboardProps {
  tenantAdminId: number;
}

const TenantAdminDashboard: React.FC<TenantAdminDashboardProps> = ({ tenantAdminId }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<string>('overview');
  const [dashboardData, setDashboardData] = useState<TenantDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [tenantAdminId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantAdminService.getDashboardData(tenantAdminId);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems: SidebarItem[] = useMemo(
    () => [
      { id: 'overview', icon: LayoutDashboard, label: 'Overview', active: activeView === 'overview' },
      { id: 'users', icon: Users, label: 'Users', active: activeView === 'users' },
      { id: 'projects', icon: FolderOpen, label: 'Projects', active: activeView === 'projects' },
      { id: 'settings', icon: SettingsIcon, label: 'Settings', active: activeView === 'settings' },
    ],
    [activeView]
  );

  const headerTitle = useMemo(() => {
    switch (activeView) {
      case 'overview': return 'Tenant Admin Dashboard';
      case 'users': return 'User Management';
      case 'projects': return 'All Projects';
      case 'settings': return 'Settings';
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
              <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
              <p>{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && dashboardData && (
            <>
              {activeView === 'overview' && (
                <div className="space-y-6">
                  <TenantInfo tenant={dashboardData.tenantInfo} />
                  <TenantKPIs
                    kpis={dashboardData.kpis}
                    totalUsers={dashboardData.totalUsers}
                    totalProjects={dashboardData.totalProjects}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-[#0c272d] mb-4">Recent Projects</h3>
                    <TenantProjects projects={dashboardData.recentProjects} />
                  </div>
                </div>
              )}
              {activeView === 'users' && <UserManagement tenantAdminId={tenantAdminId} />}
              {activeView === 'projects' && <TenantProjects projects={dashboardData.recentProjects} />}
              {activeView === 'settings' && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#9fdbc2]/20 p-8">
                  <h2 className="text-2xl font-bold text-[#0c272d] mb-4">Settings</h2>
                  <p className="text-[#0c272d]/60">Settings functionality coming soon...</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TenantAdminDashboard;

