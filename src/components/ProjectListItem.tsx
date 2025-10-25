"use client";

import React from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types/project-types';
import { formatDateSafe } from './dashboard/utils';

interface ProjectListItemProps {
  project: Project;
}

export function ProjectListItem({ project }: ProjectListItemProps) {
  const statusColors: Record<string, string> = {
    Planning: 'bg-gray-100 text-gray-800',
    Active: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Archived: 'bg-gray-100 text-gray-600'
  };

  return (
    <Link href={`/dashboard/projects/${project.proyect_id}`}>
      <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-base font-medium text-gray-900">
                {project.name_proyect}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.state] || 'bg-gray-100 text-gray-800'}`}>
                {project.state}
              </span>
              {project.type && (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                  {project.type}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {project.description}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {project.start_date && (
                <span>Start: {formatDateSafe(project.start_date)}</span>
              )}
              {project.end_date && (
                <span>End: {formatDateSafe(project.end_date)}</span>
              )}
              <span>Updated: {formatDateSafe(project.updated_at)}</span>
            </div>
          </div>
          <div className="ml-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

