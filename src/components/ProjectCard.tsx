"use client";

import React from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types/project-types';
import { formatDateSafe } from './dashboard/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    Planning: 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <Link href={`/dashboard/projects/${project.proyect_id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {project.name_proyect}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.state] || 'bg-gray-100 text-gray-800'}`}>
            {project.state}
          </span>
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {project.type && (
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
                {project.type}
              </span>
            )}
            {project.start_date && (
              <span>
                Start: {formatDateSafe(project.start_date)}
              </span>
            )}
          </div>
          {project.end_date && (
            <span>
              End: {formatDateSafe(project.end_date)}
            </span>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          Updated {formatDateSafe(project.updated_at)}
        </div>
      </div>
    </Link>
  );
}

