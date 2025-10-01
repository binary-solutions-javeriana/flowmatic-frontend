'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project, CreateProjectDto, UpdateProjectDto, ProjectState } from '@/lib/projects/types';
import { prepareCreateProjectData, prepareUpdateProjectData, parseUserId, validateDateRange } from '@/lib/projects/validation';
import { useAuthState } from '@/lib/auth-store';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectDto | UpdateProjectDto) => Promise<void>;
  project?: Project | null;
  mode: 'create' | 'edit';
}

const PROJECT_STATES: ProjectState[] = ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSubmit, project, mode }) => {
  const { user } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name_proyect: '',
    description: '',
    type: '',
    start_date: '',
    end_date: '',
    state: 'Planning' as ProjectState,
  });

  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        name_proyect: project.name_proyect,
        description: project.description || '',
        type: project.type || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        state: (project.state || 'Planning') as ProjectState,
      });
    } else if (mode === 'create') {
      setFormData({
        name_proyect: '',
        description: '',
        type: '',
        start_date: '',
        end_date: '',
        state: 'Planning',
      });
    }
  }, [mode, project, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      
      // Validate date range
      if (!validateDateRange(formData.start_date, formData.end_date)) {
        setError('End date must be after or equal to start date');
        return;
      }
      
      if (mode === 'create') {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        // Convert user ID from string to number and validate
        const userId = parseUserId(user.id);
        
        // Prepare and validate data
        const createData = prepareCreateProjectData({
          name_proyect: formData.name_proyect,
          description: formData.description,
          type: formData.type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          state: formData.state,
          created_by: userId,
        });
        
        await onSubmit(createData);
      } else {
        // Prepare update data (only sends changed fields)
        const updateData = prepareUpdateProjectData({
          name_proyect: formData.name_proyect,
          description: formData.description,
          type: formData.type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          state: formData.state,
        });
        
        await onSubmit(updateData as UpdateProjectDto);
      }
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save project');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label htmlFor="name_proyect" className="block text-sm font-medium text-[#0c272d] mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name_proyect"
              name="name_proyect"
              value={formData.name_proyect}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-lg text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20"
              placeholder="Enter project name"
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#0c272d] mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-lg text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 resize-none"
              placeholder="Enter project description"
              disabled={loading}
            />
          </div>

          {/* Type and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-[#0c272d] mb-2">
                Type
              </label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-lg text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20"
                placeholder="e.g., Web, Mobile"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-[#0c272d] mb-2">
                Status
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-lg text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20"
                disabled={loading}
              >
                {PROJECT_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-[#0c272d] mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-lg text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-[#0c272d] mb-2">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-lg text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20"
                disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#0c272d] hover:bg-[#9fdbc2]/10 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#14a67e] text-white px-6 py-2 rounded-lg hover:bg-[#14a67e]/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{mode === 'create' ? 'Create Project' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

