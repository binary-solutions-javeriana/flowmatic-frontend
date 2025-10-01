"use client";

import React from 'react';
import { useRecentProjects } from '@/lib/hooks/use-projects';
import { ProjectListItem } from '@/components/ProjectListItem';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function RecentProjectsContent() {
  const { projects, loading, error, refetch } = useRecentProjects(10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading recent projects...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error loading recent projects</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recent Projects</h1>
            <p className="text-gray-600">Your most recently updated projects</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Recent Projects Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Link
                href="/dashboard/projects"
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start working on projects to see them appear here.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/projects"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  View All Projects
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {projects.map((project) => (
                <ProjectListItem key={project.proyect_id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Project Management
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Manage all your projects, track progress, and collaborate with your team.
            </p>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
            >
              Manage Projects
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create New Project
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Start a new project and set up your team for success.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
            >
              + New Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecentProjectsPage() {
  return (
    <ProtectedRoute>
      <RecentProjectsContent />
    </ProtectedRoute>
  );
}