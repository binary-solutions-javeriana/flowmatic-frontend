'use client';

import React, { useEffect, useState } from 'react';
import { TenantAdminDashboard } from '@/components/tenant-admin';
import RoleBasedRoute from '@/components/RoleBasedRoute';
import { useRouter } from 'next/navigation';
import { getUserId, isTenantAdmin } from '@/lib/auth-redirect';
import { DarkModeProvider } from '@/lib/dark-mode-context';

const TenantAdminPage: React.FC = () => {
  const [tenantAdminId, setTenantAdminId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get tenant admin ID from stored user data
    const initializeUser = () => {
      // Verify user is tenant admin
      if (!isTenantAdmin()) {
        router.push('/dashboard');
        return;
      }

      // Get user ID
      const userId = getUserId();
      if (!userId) {
        router.push('/login');
        return;
      }

      setTenantAdminId(userId);
      setLoading(false);
    };

    initializeUser();
  }, [router]);

  if (loading || tenantAdminId === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <RoleBasedRoute allowedRoles={['TenantAdmin']}>
        <TenantAdminDashboard tenantAdminId={tenantAdminId} />
      </RoleBasedRoute>
    </DarkModeProvider>
  );
};

export default TenantAdminPage;

