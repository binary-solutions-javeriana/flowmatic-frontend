"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/lib/hooks/use-projects';
import { ProjectForm } from '@/components/ProjectForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function EditProjectContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);
  const { project, loading, error } = useProject(projectId);
  const [, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
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
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error loading project</h3>
            <p className="text-red-600 text-sm mt-1">{error || 'Project not found'}</p>
            <div className="flex space-x-3 mt-3">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600">Update &quot;{project.name_proyect}&quot; project details</p>
          </div>
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Project Details
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Project Information</h2>
            <p className="text-sm text-gray-600">
              Update the project details below. Changes will be tracked for audit purposes.
            </p>
          </div>

          <ProjectForm 
            project={project}
            isEdit={true}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>

        {/* Warning Card */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-900 font-medium mb-2">⚠️ Important Notes</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• Changes to project dates may affect task schedules and team assignments</li>
            <li>• Status changes will notify all project team members</li>
            <li>• Please ensure all information is accurate before saving</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function EditProjectPage() {
  return (
    <ProtectedRoute>
      <EditProjectContent />
    </ProtectedRoute>
  );
}

