'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import TenantInfo from './TenantInfo';
import TenantKPIs from './TenantKPIs';
import UserManagement from './UserManagement';
import TenantProjects from './TenantProjects';
import TenantAdminSettings from './TenantAdminSettings';
import Notifications from './Notifications';
import PagosFacturas from '../dashboard/PagosFacturas';
import type { SidebarItem } from '../dashboard/types';
import type { TenantDashboardResponse, ProjectSummaryDto } from '@/lib/types/tenant-admin-types';
import { tenantAdminService } from '@/lib/tenant-admin-service';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Settings as SettingsIcon,
  CreditCard,
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

  // Projects tab state
  const [projects, setProjects] = useState<ProjectSummaryDto[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
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
  }, [tenantAdminId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      const data = await tenantAdminService.getProjects(tenantAdminId);
      setProjects(data || []);
    } catch (err) {
      setProjectsError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  }, [tenantAdminId]);

  // Fetch projects when Projects tab is activated
  useEffect(() => {
    if (activeView === 'projects') {
      // Avoid refetch if already loaded once; refetch on each visit if needed by removing this guard
      if (projects.length === 0 && !projectsLoading && !projectsError) {
        loadProjects();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, loadProjects]);

  const sidebarItems: SidebarItem[] = useMemo(
    () => [
      { id: 'overview', icon: LayoutDashboard, label: 'Overview', active: activeView === 'overview' },
      { id: 'users', icon: Users, label: 'Users', active: activeView === 'users' },
      { id: 'projects', icon: FolderOpen, label: 'Projects', active: activeView === 'projects' },
      { id: 'settings', icon: SettingsIcon, label: 'Settings', active: activeView === 'settings' },
      { id: 'pagos-facturas', icon: CreditCard, label: 'Pagos y Facturas', active: activeView === 'pagos-facturas' },
    ],
    [activeView]
  );

  const headerTitle = useMemo(() => {
    switch (activeView) {
      case 'overview': return 'Tenant Admin Dashboard';
      case 'users': return 'User Management';
      case 'projects': return 'All Projects';
      case 'settings': return 'Settings';
      case 'pagos-facturas': return 'Pagos y Facturas';
      case 'notifications': return 'Notifications';
      default: return activeView.charAt(0).toUpperCase() + activeView.slice(1);
    }
  }, [activeView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white dark:from-gray-900 dark:to-gray-800 flex">
      <Sidebar
        isOpen={sidebarOpen}
        items={sidebarItems}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onSelect={setActiveView}
      />

      <div className="flex-1 flex flex-col">
        <Header title={headerTitle} onNavigate={setActiveView} showSearch={false}/>
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
                  {dashboardData.tenantInfo && <TenantInfo tenant={dashboardData.tenantInfo} />}
                  {dashboardData.kpis && (
                    <TenantKPIs
                      kpis={dashboardData.kpis}
                      totalUsers={dashboardData.totalUsers}
                      totalProjects={dashboardData.totalProjects}
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-[#0c272d] dark:text-gray-100 mb-4">Recent Projects</h3>
                    <TenantProjects projects={dashboardData.recentProjects} />
                  </div>
                </div>
              )}
              {activeView === 'users' && <UserManagement tenantAdminId={tenantAdminId} />}
              {activeView === 'projects' && (
                <>
                  {projectsLoading && (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
                    </div>
                  )}
                  {projectsError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
                      <h3 className="font-semibold mb-2">Error Loading Projects</h3>
                      <p>{projectsError}</p>
                      <button
                        onClick={loadProjects}
                        className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  {!projectsLoading && !projectsError && (
                    <TenantProjects projects={projects} />
                  )}
                </>
              )}
              {activeView === 'settings' && <TenantAdminSettings tenantAdminId={tenantAdminId} />}
              {activeView === 'pagos-facturas' && <PagosFacturas tenantAdminId={tenantAdminId} />}
              {activeView === 'notifications' && <Notifications />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TenantAdminDashboard;

