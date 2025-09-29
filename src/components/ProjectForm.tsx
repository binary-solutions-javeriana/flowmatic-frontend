"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectsService } from '@/lib/services/projects-service';
// import { config } from '@/lib/config';
// import { getAccessToken, getUserIdFromToken } from '@/lib/auth-utils';
import type { Project } from '@/lib/types/project-types';
import type { ProjectFormData, CreateProjectDto, UpdateProjectDto } from '@/lib/types/project-dto';
import { cleanProjectData } from '@/lib/types/project-dto';

interface ProjectFormProps {
  project?: Project;
  isEdit?: boolean;
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
}

// const getStoredToken = (): string | null => {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem(config.auth.accessTokenKey);
//   }
//   return null;
// };

export function ProjectForm({ project, isEdit = false, onSuccess, onCancel }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    name_proyect: '',
    description: '',
    type: '',
    start_date: '',
    end_date: '',
    state: 'Planning'
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && project) {
      setFormData({
        name_proyect: project.name_proyect,
        description: project.description || '',
        type: project.type || '',
        start_date: project.start_date ? project.start_date.split('T')[0] : '', // Convert to YYYY-MM-DD
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
        state: project.state
      });
    }
  }, [isEdit, project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      // const userId = getUserIdFromToken(token || undefined);
      
      if (isEdit && project) {
        // Update existing project
        const updateData = cleanProjectData(formData) as UpdateProjectDto;

        console.log('Sending UPDATE data to backend:', JSON.stringify(updateData, null, 2));
        const updatedProject = await projectsService.updateProject(project.proyect_id, updateData, token || undefined);
        
        // Signal that project was updated for cache invalidation
        localStorage.setItem('project_updated', 'true');
        
        if (onSuccess) {
          onSuccess(updatedProject);
        } else {
          router.push(`/dashboard/projects/${updatedProject.proyect_id}`);
        }
      } else {
        // Create new project        
        const createData = cleanProjectData(formData) as CreateProjectDto;

        console.log('Sending CREATE data to backend:', JSON.stringify(createData, null, 2));
        const newProject = await projectsService.createProject(createData, token || undefined);
        
        // Signal that project was created for cache invalidation
        localStorage.setItem('project_created', 'true');
        
        if (onSuccess) {
          onSuccess(newProject);
        } else {
          router.push('/dashboard/projects');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save project';
      setError(message);
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Project Name */}
      <div>
        <label htmlFor="name_proyect" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name *
        </label>
        <input
          type="text"
          id="name_proyect"
          name="name_proyect"
          required
          value={formData.name_proyect}
          onChange={handleInputChange}
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
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Project description"
        />
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
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="e.g., Software Development, Research, Infrastructure"
        />
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            required
            value={formData.start_date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="state"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>





      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}