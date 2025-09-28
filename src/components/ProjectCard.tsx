import React from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types/project-types';

interface ProjectCardProps {
  project: Project;
}

const statusColors: Record<string, string> = {
  Planning: 'bg-gray-100 text-gray-800',
  Active: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Archived: 'bg-gray-100 text-gray-600'
};

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-600',
  High: 'bg-orange-100 text-orange-600',
  Critical: 'bg-red-100 text-red-600'
};

export function ProjectCard({ project }: ProjectCardProps) {
  // Progress not available from backend - use default
  const progressPercentage = 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {project.name_proyect}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.state] || 'bg-gray-100 text-gray-800'}`}>
            {project.state}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Team</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No date'}</span>
          </div>
        </div>
        
        <Link
          href={`/dashboard/projects/${project.proyect_id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details →
        </Link>
      </div>

      {/* Tags functionality not available in current backend */}
    </div>
  );
}