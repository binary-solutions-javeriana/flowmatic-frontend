'use client';

import React from 'react';
import { TrendingUp, CheckCircle, Users, FolderOpen } from 'lucide-react';
import type { TenantKpiDto } from '@/lib/types/tenant-admin-types';

interface TenantKPIsProps {
  kpis: TenantKpiDto;
  totalUsers?: number;
  totalProjects?: number;
}

const TenantKPIs: React.FC<TenantKPIsProps> = ({ kpis, totalUsers, totalProjects }) => {
  const kpiCards = [
    {
      title: 'Total Users',
      value: totalUsers ?? 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Projects',
      value: totalProjects ?? 0,
      icon: FolderOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Active Projects',
      value: kpis.activeProjects ?? 0,
      icon: TrendingUp,
      color: 'from-[#14a67e] to-[#0f8263]',
      bgColor: 'bg-[#14a67e]/5',
      iconBg: 'bg-[#14a67e]/10',
      iconColor: 'text-[#14a67e]'
    },
    {
      title: 'Completed Tasks',
      value: kpis.completedTasks ?? 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'User Engagement',
      value: `${(kpis.userEngagement ?? 0).toFixed(1)}%`,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      showProgress: true,
      progress: kpis.userEngagement ?? 0
    },
    {
      title: 'Project Completion',
      value: `${(kpis.projectCompletionRate ?? 0).toFixed(1)}%`,
      icon: CheckCircle,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      showProgress: true,
      progress: kpis.projectCompletionRate ?? 0
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`${card.bgColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-transparent hover:border-current/20`}
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${card.iconBg} rounded-xl`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                {card.value}
              </p>
            </div>

            {card.showProgress && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${card.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(card.progress || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TenantKPIs;

