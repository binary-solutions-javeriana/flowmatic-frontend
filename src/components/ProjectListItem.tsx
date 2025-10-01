import React from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types/project-types';

interface ProjectListItemProps {
  project: Project;
}

const statusColors: Record<string, string> = {
  Planning: 'text-gray-600',
  Active: 'text-blue-600',
  'In Progress': 'text-blue-600',
  'On Hold': 'text-yellow-600',
  Completed: 'text-green-600',
  Cancelled: 'text-red-600',
  Archived: 'text-gray-500'
};

const statusBadgeColors: Record<string, string> = {
  Planning: 'bg-gray-100 text-gray-800',
  Active: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Archived: 'bg-gray-100 text-gray-600'
};

export function ProjectListItem({ project }: ProjectListItemProps) {
  // Use default values since these properties don't exist in the current Project type
  const progressPercentage = 0; // This would come from project stats in real implementation
  const totalTasks = 24; // This would come from API in real implementation
  const completedTasks = Math.floor((totalTasks * progressPercentage) / 100);

  return (
    <Link 
      href={`/dashboard/projects/${project.proyect_id}`}
      className="block hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-4 flex-1">
          {/* Project Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6h-3a1 1 0 100 2h3v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.707 7.293a1 1 0 00-1.414 1.414L7.586 16a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 13.172l-2.293-2.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {project.name_proyect}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeColors[project.state] || 'bg-gray-100 text-gray-800'}`}>
                {project.state}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate mt-1">
              {completedTasks}/{totalTasks} tasks completed
            </p>
          </div>
        </div>

        {/* Progress and Completion */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Progress Bar */}
          <div className="w-20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{progressPercentage}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="text-right">
            <div className={`text-xs font-medium ${statusColors[project.state] || 'text-gray-600'}`}>
              {project.state}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {new Date(project.updated_at).toLocaleDateString()}
            </div>
          </div>

          {/* Arrow */}
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </Link>
  );
}