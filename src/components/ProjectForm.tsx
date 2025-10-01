"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProject, useUpdateProject } from '@/lib/hooks/use-projects';
import { useAuth } from '@/lib/auth-store';
import type { Project, CreateProjectRequest } from '@/lib/types/project-types';

interface ProjectFormProps {
  project?: Project;
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ project, isEdit = false, onSuccess, onCancel }: ProjectFormProps) {
  const router = useRouter();
  const { state } = useAuth();
  const { createProject, loading: createLoading, error: createError } = useCreateProject();
  const { updateProject, loading: updateLoading, error: updateError } = useUpdateProject();

  const [formData, setFormData] = useState<CreateProjectRequest>({
    name_proyect: project?.name_proyect || '',
    description: project?.description || '',
    state: project?.state || 'Planning',
    type: project?.type || '',
    start_date: project?.start_date ? project.start_date.split('T')[0] : '',
    end_date: project?.end_date ? project.end_date.split('T')[0] : '',
    created_by: project?.created_by || (typeof state.user?.id === 'string' ? parseInt(state.user.id, 10) : state.user?.id) || 0
  });

  const loading = createLoading || updateLoading;
  const error = createError || updateError;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data based on mode
    let result;
    if (isEdit && project) {
      // For update, don't send created_by
      const updateData = {
        name_proyect: formData.name_proyect,
        description: formData.description || undefined,
        state: formData.state,
        type: formData.type || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      };
      result = await updateProject(project.proyect_id, updateData);
    } else {
      // For create, include created_by
      const createData: CreateProjectRequest = {
        ...formData,
        description: formData.description || undefined,
        type: formData.type || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        created_by: (typeof state.user?.id === 'string' ? parseInt(state.user.id, 10) : state.user?.id) || 0
      };
      result = await createProject(createData);
    }

    if (result) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/projects');
      }
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/dashboard/projects');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Project Name */}
      <div>
        <label htmlFor="name_proyect" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name_proyect"
          name="name_proyect"
          value={formData.name_proyect}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter project name"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter project description"
        />
      </div>

      {/* State */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Project Type
        </label>
        <input
          type="text"
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="e.g., Web Development, Mobile App, Research"
        />
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* End Date */}
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
          End Date
        </label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Project' : 'Create Project')}
        </button>
        <button
          type="button"
          onClick={handleCancelClick}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

