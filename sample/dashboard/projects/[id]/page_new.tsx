"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject, useDeleteProject } from '@/lib/hooks/use-projects';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

// Status color mapping for project states
const statusColors: Record<string, string> = {
  'Planning': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-green-100 text-green-800',
  'On Hold': 'bg-gray-100 text-gray-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Project</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-4">The requested project could not be found.</p>
            <Link
              href="/dashboard/projects"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/dashboard" className="hover:text-green-600">Dashboard</Link>
            <span className="mx-2">›</span>
            <Link href="/dashboard/projects" className="hover:text-green-600">Projects</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{project.name_proyect}</span>
          </nav>
        </div>

        {/* Main Project Information */}
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
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Project Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Type:</dt>
                  <dd className="text-gray-900">{project.type || 'Not specified'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Status:</dt>
                  <dd className="text-gray-900">{project.state}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Created:</dt>
                  <dd className="text-gray-900">{new Date(project.created_at).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Last Updated:</dt>
                  <dd className="text-gray-900">
                    {project.updated_at
                      ? new Date(project.updated_at).toLocaleDateString()
                      : 'Not available'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Timeline</h3>
              <dl className="space-y-2 text-sm">
                {project.start_date ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Start Date:</dt>
                    <dd className="text-gray-900">{new Date(project.start_date).toLocaleDateString()}</dd>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Start Date:</dt>
                    <dd className="text-gray-500">Not set</dd>
                  </div>
                )}
                {project.end_date ? (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">End Date:</dt>
                    <dd className="text-gray-900">{new Date(project.end_date).toLocaleDateString()}</dd>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">End Date:</dt>
                    <dd className="text-gray-500">Not set</dd>
                  </div>
                )}
                {project.start_date && project.end_date && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Duration:</dt>
                    <dd className="text-gray-900">
                      {Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Tasks</h4>
              <p className="text-sm text-gray-600">Manage project tasks and assignments</p>
              <button className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                View Tasks
              </button>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
              <p className="text-sm text-gray-600">Project files and documentation</p>
              <button className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                View Documents
              </button>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Team</h4>
              <p className="text-sm text-gray-600">Manage team members and roles</p>
              <button className="mt-2 text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                View Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-3">Delete Project</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete &quot;{project.name_proyect}&quot;? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 mt-4 px-7">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
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