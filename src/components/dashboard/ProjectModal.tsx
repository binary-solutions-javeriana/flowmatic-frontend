'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, CalendarCheck } from 'lucide-react';
import type { Project, CreateProjectDto, UpdateProjectDto, ProjectState } from '@/lib/projects/types';
import { prepareCreateProjectData, prepareUpdateProjectData, parseUserId } from '@/lib/projects/validation';
import { useAuthState } from '@/lib/auth-store';
import { useCreateProject, useUpdateProject } from '@/lib/projects';
import { authApi } from '@/lib/authenticated-api';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectDto | UpdateProjectDto) => Promise<void>;
  project?: Project | null;
  mode: 'create' | 'edit';
}

const PROJECT_STATES: ProjectState[] = ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

const PROJECT_TYPES = [
  'Web Development',
  'Mobile Development',
  'Software Development',
  'Design',
  'Research',
  'Marketing',
  'Infrastructure',
  'Other'
];

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSubmit, project, mode }) => {
  const { user } = useAuthState();
  const { createProject } = useCreateProject();
  const { updateProject } = useUpdateProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name_proyect: '',
    description: '',
    type: '',
    start_date: '',
    end_date: '',
    state: 'Planning' as ProjectState,
  });
  const [methodologyOptions, setMethodologyOptions] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    // Load methodology options for TYPE selector
    const loadMethodologies = async () => {
      try {
        const options = await authApi.get<Array<{ id: number; name: string }>>('/projects/methodology-options');
        setMethodologyOptions(options || []);
      } catch (e) {
        console.warn('Failed to load methodology options', e);
      }
    };
    loadMethodologies();

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
    setSuccess(false);
    
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Real-time validation
    if (name === 'name_proyect' && value.trim().length < 3) {
      setFieldErrors(prev => ({ ...prev, name_proyect: 'Project name must be at least 3 characters' }));
    }
    
    if (name === 'end_date' && formData.start_date && value) {
      if (new Date(value) < new Date(formData.start_date)) {
        setFieldErrors(prev => ({ ...prev, end_date: 'End date must be after start date' }));
      }
    }
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, start_date: today }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name_proyect.trim()) {
      errors.name_proyect = 'Project name is required';
    } else if (formData.name_proyect.trim().length < 3) {
      errors.name_proyect = 'Project name must be at least 3 characters';
    }
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (mode === 'create') {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        // Convert user ID from string to number and validate
        const userId = parseUserId(user.id);
        
        // Prepare and validate data
        const createData = prepareCreateProjectData({
          name_proyect: formData.name_proyect.trim(),
          description: formData.description.trim(),
          type: formData.type.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
          state: formData.state,
          created_by: userId,
        });
        
        const result = await createProject(createData);
        
        if (result) {
          setSuccess(true);
          setTimeout(() => {
            onClose();
            onSubmit(createData);
          }, 1500);
        }
      } else {
        // Prepare update data (only sends changed fields)
        const updateData = prepareUpdateProjectData({
          name_proyect: formData.name_proyect.trim(),
          description: formData.description.trim(),
          type: formData.type.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
          state: formData.state,
        });
        
        if (project) {
          const result = await updateProject(project.proyect_id, updateData);
          
          if (result) {
            setSuccess(true);
            setTimeout(() => {
              onClose();
              onSubmit(updateData as UpdateProjectDto);
            }, 1500);
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#9fdbc2]/30 animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="relative px-8 py-6 border-b border-[#9fdbc2]/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0c272d]">
                {mode === 'create' ? 'Create New Project' : 'Edit Project'}
              </h2>
              <p className="text-sm text-[#0c272d]/60 mt-1">
                {mode === 'create' ? 'Fill in the details to start your new project' : 'Update your project information'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#0c272d]/40 hover:text-[#0c272d] hover:bg-[#9fdbc2]/10 rounded-xl p-2 transition-all duration-200"
              disabled={loading}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200/50 rounded-xl p-4 text-red-700 text-sm flex items-start space-x-3 backdrop-blur-sm animate-[shake_0.3s_ease-in-out]">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200/50 rounded-xl p-4 text-green-700 text-sm flex items-start space-x-3 backdrop-blur-sm animate-[slideDown_0.3s_ease-out]">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="flex-1 font-medium">{mode === 'create' ? '🎉 Project created successfully!' : '✨ Project updated successfully!'}</span>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-2">
            <label htmlFor="name_proyect" className="block text-sm font-semibold text-[#0c272d]">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name_proyect"
              name="name_proyect"
              value={formData.name_proyect}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white/60 border rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                fieldErrors.name_proyect 
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                  : 'border-[#9fdbc2]/30 focus:ring-[#14a67e]/20 focus:border-[#14a67e]/40'
              }`}
              placeholder="e.g., Website Redesign, Mobile App Launch"
              disabled={loading}
              required
            />
            {fieldErrors.name_proyect && (
              <p className="mt-2 text-sm text-red-600 flex items-center space-x-1.5 animate-[slideDown_0.2s_ease-out]">
                <AlertCircle className="w-4 h-4" />
                <span>{fieldErrors.name_proyect}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-[#0c272d]">
              Description
              <span className="text-xs font-normal text-[#0c272d]/50 ml-2">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-white/60 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 focus:border-[#14a67e]/40 focus:bg-white resize-none transition-all duration-200"
              placeholder="Describe the project goals, scope, and key objectives..."
              disabled={loading}
            />
          </div>

          {/* Type and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-semibold text-[#0c272d]">
                Project Type
                <span className="text-xs font-normal text-[#0c272d]/50 ml-2">(Optional)</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/60 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 focus:border-[#14a67e]/40 focus:bg-white cursor-pointer transition-all duration-200 appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239fdbc2' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                disabled={loading}
              >
                <option value="">Select a type...</option>
                {methodologyOptions.map(opt => (
                  <option key={opt.id} value={opt.name}>{opt.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-semibold text-[#0c272d]">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/60 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 focus:border-[#14a67e]/40 focus:bg-white cursor-pointer transition-all duration-200 appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239fdbc2' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                disabled={loading}
                required
              >
                {PROJECT_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="start_date" className="block text-sm font-semibold text-[#0c272d]">
                  Start Date
                  <span className="text-xs font-normal text-[#0c272d]/50 ml-2">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={handleSetToday}
                  disabled={loading}
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-[#14a67e] hover:bg-[#14a67e]/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                  title="Set to today"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Today</span>
                </button>
              </div>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/60 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 focus:border-[#14a67e]/40 focus:bg-white cursor-pointer transition-all duration-200"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="end_date" className="block text-sm font-semibold text-[#0c272d]">
                End Date
                <span className="text-xs font-normal text-[#0c272d]/50 ml-2">(Optional)</span>
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/60 border rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 cursor-pointer transition-all duration-200 ${
                  fieldErrors.end_date 
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                    : 'border-[#9fdbc2]/30 focus:ring-[#14a67e]/20 focus:border-[#14a67e]/40 focus:bg-white'
                }`}
                disabled={loading}
              />
              {fieldErrors.end_date && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1.5 animate-[slideDown_0.2s_ease-out]">
                  <AlertCircle className="w-4 h-4" />
                  <span>{fieldErrors.end_date}</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-[#9fdbc2]/20 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-[#0c272d] hover:bg-[#9fdbc2]/10 rounded-xl transition-all duration-200 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#14a67e] text-white px-8 py-3 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
              disabled={loading || success}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {success && (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>
                {loading ? 'Saving...' : success ? 'Success!' : mode === 'create' ? 'Create Project' : 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

