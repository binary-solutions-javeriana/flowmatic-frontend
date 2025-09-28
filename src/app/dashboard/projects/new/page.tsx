"use client";

import React from 'react';
import { ProjectForm } from '@/components/ProjectForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function NewProjectContent() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600">Set up a new project for your team</p>
          </div>
          <Link
            href="/dashboard/projects"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Projects
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Project Information</h2>
            <p className="text-sm text-gray-600">
              Fill in the details below to create your new project. Required fields are marked with an asterisk (*).
            </p>
          </div>

          <ProjectForm />
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 font-medium mb-2">💡 Project Setup Tips</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Choose a descriptive project name that clearly identifies the initiative</li>
            <li>• Set realistic start and end dates based on project scope</li>
            <li>• Select appropriate priority and risk levels for better resource allocation</li>
            <li>• Add a detailed description to help team members understand project goals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <ProtectedRoute>
      <NewProjectContent />
    </ProtectedRoute>
  );
}