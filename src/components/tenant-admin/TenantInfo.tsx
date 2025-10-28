'use client';

import React from 'react';
import { Building2, Calendar } from 'lucide-react';
import type { TenantDto } from '@/lib/types/tenant-admin-types';

interface TenantInfoProps {
  tenant: TenantDto;
}

const TenantInfo: React.FC<TenantInfoProps> = ({ tenant }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-[#9fdbc2]/20 dark:border-gray-700/50 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#14a67e]/10 rounded-xl">
            <Building2 className="w-6 h-6 text-[#14a67e]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100">{tenant.universityName || 'Unknown University'}</h2>
            <p className="text-sm text-[#0c272d]/60 dark:text-gray-400">Tenant Information</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-[#14a67e]/10 dark:bg-[#14a67e]/20 text-[#14a67e] dark:text-[#14a67e] text-xs font-semibold rounded-full">
          ID: {tenant.tenantId}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-[#9fdbc2]/5 dark:from-gray-700/50 to-transparent rounded-xl">
          <Calendar className="w-5 h-5 text-[#14a67e]" />
          <div>
            <p className="text-xs text-[#0c272d]/60 dark:text-gray-400 font-medium">Created</p>
            <p className="text-sm font-semibold text-[#0c272d] dark:text-gray-100">{formatDate(tenant.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-[#9fdbc2]/5 dark:from-gray-700/50 to-transparent rounded-xl">
          <Calendar className="w-5 h-5 text-[#14a67e]" />
          <div>
            <p className="text-xs text-[#0c272d]/60 dark:text-gray-400 font-medium">Last Updated</p>
            <p className="text-sm font-semibold text-[#0c272d] dark:text-gray-100">{formatDate(tenant.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantInfo;

