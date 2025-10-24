"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject, useDeleteProject } from '@/lib/hooks/use-projects';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

// Status color mapping for project states
// const statusColors = {
//   'Planning': 'bg-blue-100 text-blue-800',
//   'In Progress': 'bg-yellow-100 text-yellow-800',
//   'Completed': 'bg-green-100 text-green-800',
//   'On Hold': 'bg-gray-100 text-gray-800',
//   'Cancelled': 'bg-red-100 text-red-800',
// };

function ProjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);
  const { project, loading, error, refetch } = useProject(projectId);
  const { deleteProject, loading: deleteLoading } = useDeleteProject();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteProject = async () => {
    const success = await deleteProject(projectId);
    if (success) {
      // Redirect to projects list after successful deletion
      router.push('/dashboard/projects');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading project...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error loading project</h3>
            <p className="text-red-600 text-sm mt-1">{error || 'Project not found'}</p>
            <div className="flex space-x-3 mt-3">
              <button
                onClick={refetch}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Try Again
              </button>
              <Link
                href="/dashboard/projects"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
              >
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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

  // const priorityColors: Record<string, string> = {
  //   Low: 'bg-gray-100 text-gray-600',
  //   Medium: 'bg-blue-100 text-blue-600',
  //   High: 'bg-orange-100 text-orange-600',
  //   Critical: 'bg-red-100 text-red-600'
  // };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name_proyect}</h1>
            <p className="text-gray-600">Project Details</p>
          </div>
          <Link
            href="/dashboard/projects"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Projects
          </Link>
        </div>

        {/* Project Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{project.name_proyect}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.state] || 'bg-gray-100 text-gray-800'}`}>
                  {project.state}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                  {project.type || 'General'}
                </span>
              </div>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6">
            <div className="flex space-x-3">
              <Link
                href={`/dashboard/projects/${project.proyect_id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Project
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Project Information</h3>
              <dl className="space-y-2 text-sm">
                {project.start_date && (
                  <div>
                    <dt className="text-gray-500">Start Date</dt>
                    <dd className="text-gray-900">{new Date(project.start_date).toLocaleDateString()}</dd>
                  </div>
                )}
                {project.end_date && (
                  <div>
                    <dt className="text-gray-500">End Date</dt>
                    <dd className="text-gray-900">{new Date(project.end_date).toLocaleDateString()}</dd>
                  </div>
                )}
                {project.type && (
                  <div>
                    <dt className="text-gray-500">Type</dt>
                    <dd className="text-gray-900">{project.type}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Timeline Information</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-900">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="text-gray-900">{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Link
            href={`/dashboard/projects/${project.proyect_id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Edit Project
          </Link>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            View Tasks
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
            Project Settings
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Delete Project
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete Project
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{project.name_proyect}&quot;? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteProject}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute>
      <ProjectDetailContent />
    </ProtectedRoute>
  );
}