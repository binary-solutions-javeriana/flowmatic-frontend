'use client';

import React from 'react';
import { FolderOpen, Calendar, CheckCircle, Clock } from 'lucide-react';
import type { ProjectSummaryDto } from '@/lib/types/tenant-admin-types';

interface TenantProjectsProps {
  projects: ProjectSummaryDto[];
}

const TenantProjects: React.FC<TenantProjectsProps> = ({ projects }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (state: string) => {
    const stateUpper = state.toUpperCase();
    switch (stateUpper) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PLANNING':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ON HOLD':
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const calculateProgress = (project: ProjectSummaryDto) => {
    if (project.taskCount === 0) return 0;
    return Math.round((project.completedTasks / project.taskCount) * 100);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#9fdbc2]/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#14a67e]/5 to-[#9fdbc2]/5 p-6 border-b border-[#9fdbc2]/20">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#14a67e]/10 rounded-xl">
            <FolderOpen className="w-6 h-6 text-[#14a67e]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0c272d]">All Projects</h2>
            <p className="text-sm text-[#0c272d]/60">{projects.length} total projects</p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto text-[#0c272d]/20 mb-4" />
            <p className="text-lg font-medium text-[#0c272d]/60">No projects found</p>
            <p className="text-sm text-[#0c272d]/40">Projects will appear here once created</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const progress = calculateProgress(project);
              return (
                <div
                  key={project.projectId}
                  className="bg-gradient-to-br from-white to-[#9fdbc2]/5 border border-[#9fdbc2]/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#14a67e]/30"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#0c272d] mb-2 line-clamp-2">
                        {project.nameProject}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.state)}`}>
                        {project.state}
                      </span>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-[#0c272d]/60">
                        <CheckCircle className="w-4 h-4" />
                        <span>Tasks</span>
                      </div>
                      <span className="font-semibold text-[#0c272d]">
                        {project.completedTasks} / {project.taskCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-[#0c272d]/60">
                        <Calendar className="w-4 h-4" />
                        <span>Start</span>
                      </div>
                      <span className="font-medium text-[#0c272d]">
                        {formatDate(project.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-[#0c272d]/60">
                        <Clock className="w-4 h-4" />
                        <span>End</span>
                      </div>
                      <span className="font-medium text-[#0c272d]">
                        {formatDate(project.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#0c272d]/60 font-medium">Progress</span>
                      <span className="text-[#14a67e] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantProjects;

