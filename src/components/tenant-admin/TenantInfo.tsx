'use client';

import React from 'react';
import { Building2, Calendar } from 'lucide-react';
import type { TenantDto } from '@/lib/types/tenant-admin-types';

interface TenantInfoProps {
  tenant: TenantDto;
}

const TenantInfo: React.FC<TenantInfoProps> = ({ tenant }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#9fdbc2]/20 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#14a67e]/10 rounded-xl">
            <Building2 className="w-6 h-6 text-[#14a67e]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0c272d]">{tenant.universityName}</h2>
            <p className="text-sm text-[#0c272d]/60">Tenant Information</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-[#14a67e]/10 text-[#14a67e] text-xs font-semibold rounded-full">
          ID: {tenant.tenantId}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-[#9fdbc2]/5 to-transparent rounded-xl">
          <Calendar className="w-5 h-5 text-[#14a67e]" />
          <div>
            <p className="text-xs text-[#0c272d]/60 font-medium">Created</p>
            <p className="text-sm font-semibold text-[#0c272d]">{formatDate(tenant.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-[#9fdbc2]/5 to-transparent rounded-xl">
          <Calendar className="w-5 h-5 text-[#14a67e]" />
          <div>
            <p className="text-xs text-[#0c272d]/60 font-medium">Last Updated</p>
            <p className="text-sm font-semibold text-[#0c272d]">{formatDate(tenant.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantInfo;

