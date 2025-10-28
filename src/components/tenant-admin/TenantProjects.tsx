'use client';

import React from 'react';
import { FolderOpen, Calendar, CheckCircle, Clock } from 'lucide-react';
import type { ProjectSummaryDto } from '@/lib/types/tenant-admin-types';

interface TenantProjectsProps {
  projects?: ProjectSummaryDto[];
}

const TenantProjects: React.FC<TenantProjectsProps> = ({ projects: projectsProp }) => {
  // Ensure projects is always an array
  const projects = projectsProp ?? [];
  
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
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700';
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700';
      case 'PLANNING':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700';
      case 'ON HOLD':
      case 'ON_HOLD':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700';
      case 'CANCELLED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const calculateProgress = (project: ProjectSummaryDto) => {
    const taskCount = project.taskCount ?? 0;
    const completedTasks = project.completedTasks ?? 0;
    if (taskCount === 0) return 0;
    return Math.round((completedTasks / taskCount) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-[#9fdbc2]/20 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#14a67e]/5 dark:from-gray-700/50 to-[#9fdbc2]/5 dark:to-gray-600/50 p-6 border-b border-[#9fdbc2]/20 dark:border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#14a67e]/10 rounded-xl">
            <FolderOpen className="w-6 h-6 text-[#14a67e]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100">All Projects</h2>
            <p className="text-sm text-[#0c272d]/60 dark:text-gray-400">{projects.length} total projects</p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto text-[#0c272d]/20 mb-4" />
            <p className="text-lg font-medium text-[#0c272d]/60 dark:text-gray-400">No projects found</p>
            <p className="text-sm text-[#0c272d]/40 dark:text-gray-500">Projects will appear here once created</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const progress = calculateProgress(project);
              return (
                <div
                  key={project.projectId}
                  className="bg-gradient-to-br from-white dark:from-gray-800 to-[#9fdbc2]/5 dark:to-gray-700/50 border border-[#9fdbc2]/20 dark:border-gray-700/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#14a67e]/30 dark:hover:border-[#14a67e]/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#0c272d] dark:text-gray-100 mb-2 line-clamp-2">
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
                      <div className="flex items-center space-x-2 text-[#0c272d]/60 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Tasks</span>
                      </div>
                      <span className="font-semibold text-[#0c272d] dark:text-gray-100">
                        {project.completedTasks ?? 0} / {project.taskCount ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-[#0c272d]/60 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Start</span>
                      </div>
                      <span className="font-medium text-[#0c272d] dark:text-gray-100">
                        {formatDate(project.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-[#0c272d]/60 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>End</span>
                      </div>
                      <span className="font-medium text-[#0c272d] dark:text-gray-100">
                        {formatDate(project.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#0c272d]/60 dark:text-gray-400 font-medium">Progress</span>
                      <span className="text-[#14a67e] dark:text-[#14a67e] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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

