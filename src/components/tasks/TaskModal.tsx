'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, AlertCircle, Plus } from 'lucide-react';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskState, TaskPriority } from '@/lib/types/task-types';
import { useCreateTask, useUpdateTask } from '@/lib/hooks/use-tasks';
import { useProjects } from '@/lib/hooks/use-projects';
import { validateTaskData } from '@/lib/tasks/utils';
import { formatDateSafe } from '../dashboard/utils';
import { useAuthState } from '@/lib/auth-store';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Task) => void;
  mode: 'create' | 'edit';
  task?: Task | null;
  projectId?: number;
  parentTaskId?: number;
  initialState?: TaskState;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  task,
  projectId,
  parentTaskId,
  initialState
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    state: 'To Do' as TaskState,
    priority: 'Medium' as any,
    assigned_to_ids: '', // will be replaced by select of users
    limit_date: '',
    project_id: ''
  });
  const [tenantUsers, setTenantUsers] = useState<Array<{ id: number; email?: string; mail?: string; name?: string }>>([]);
  const [assigneeUserId, setAssigneeUserId] = useState<string>('');
  const { user } = useAuthState();
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTask, loading: creating, error: createError } = useCreateTask();
  const { updateTask, loading: updating, error: updateError } = useUpdateTask();
  const { projects, loading: projectsLoading } = useProjects({ page: 1, limit: 100 });

  // Initialize form data and fetch tenant users
  useEffect(() => {
    const loadTenantUsers = async () => {
      try {
        const auth = await import('@/lib/authenticated-api');
        let users: Array<{ id: number; email?: string; mail?: string; name?: string }> = [];
        const creatorMail = user?.email;
        const tenantId = (user as any)?.user_metadata?.tenantId || (user as any)?.tenantId;
        if (creatorMail) {
          users = await auth.authApi.get(`/tasks/assignee-options?creatorMail=${encodeURIComponent(creatorMail)}`);
        } else if (tenantId) {
          users = await auth.authApi.get(`/tasks/assignee-options/by-tenant?tenantId=${encodeURIComponent(String(tenantId))}`);
        } else {
          users = await auth.authApi.get(`/tasks/assignee-options`);
        }
        setTenantUsers(Array.isArray(users) ? users : []);
      } catch (e) {
        console.warn('Failed to load tenant users', e);
      }
    };
    loadTenantUsers();

    if (mode === 'edit' && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        state: task.state,
        priority: (task.priority as any) || 'Medium',
        assigned_to_ids: task.assigned_to_ids || '',
        limit_date: task.limit_date && formatDateSafe(task.limit_date) !== 'Unknown' ? formatDateSafe(task.limit_date) : '',
        project_id: projectId ? projectId.toString() : ''
      });
      setAssigneeUserId('');
    } else {
      setFormData({
        title: '',
        description: '',
        state: initialState || 'To Do',
        priority: 'Medium' as any,
        assigned_to_ids: '',
        limit_date: '',
        project_id: projectId ? projectId.toString() : ''
      });
      setAssigneeUserId(user?.id ? String(user.id) : '');
    }
    setErrors([]);
  }, [mode, task, isOpen, initialState, projectId, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Validate form data
      const validation = validateTaskData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      let result: Task | null = null;

      if (mode === 'create') {
        const selectedProjectId = formData.project_id ? parseInt(formData.project_id) : projectId;
        const createData: CreateTaskRequest = {
          title: formData.title,
          description: formData.description || undefined,
          state: formData.state,
          // map Spanish labels to backend expected text values
          // keep UI labels but backend expects numeric 1-5; mapping handled in hook
          priority: (formData.priority as any) as TaskPriority,
          created_by: user?.id ? (typeof user.id === 'string' ? parseInt(user.id, 10) : (user.id as unknown as number)) : 0,
          // assignee handled by backend via dedicated endpoint; omit here per validation
          // do not send assigned_to_ids here; we will have a dedicated assign flow
          limit_date: formData.limit_date || undefined,
          ...(selectedProjectId && { proyect_id: selectedProjectId }),
          ...(parentTaskId && { parent_task_id: parentTaskId })
        };

        result = await createTask(createData);
      } else if (mode === 'edit' && task) {
        const updateData: UpdateTaskRequest = {
          title: formData.title,
          description: formData.description || undefined,
          state: formData.state,
          priority: (formData.priority as any) as TaskPriority,
          // do not send assigned_to_ids in update payload
          limit_date: formData.limit_date || undefined
        };

        result = await updateTask(task.task_id, updateData);
      }

      if (result) {
        onSubmit(result);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      setErrors(['Failed to save task. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const loading = creating || updating;
  const error = createError || updateError;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#9fdbc2]/20">
          <h2 className="text-xl font-bold text-[#0c272d]">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#0c272d]/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Errors */}
          {(errors.length > 0 || error) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {error && <li>• {error}</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#0c272d] mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300"
              disabled={isSubmitting}
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
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Project Selection - Only show when no specific projectId is provided */}
          {!projectId && mode === 'create' && (
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-[#0c272d] mb-2">
                Project *
              </label>
              <select
                id="project_id"
                value={formData.project_id}
                onChange={(e) => handleInputChange('project_id', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300"
                disabled={isSubmitting || projectsLoading}
                required
              >
                <option value="">Select a project...</option>
                {projects?.map((project) => (
                  <option key={project.proyect_id} value={project.proyect_id}>
                    {project.name_proyect}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* State and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-[#0c272d] mb-2">
                Status
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300"
                disabled={isSubmitting}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-[#0c272d] mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300"
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Assigned User (Tenant-scoped, single select) */}
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-[#0c272d] mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Assign To</span>
              </div>
            </label>
            <select
              id="assignee"
              value={assigneeUserId}
              onChange={(e) => setAssigneeUserId(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300"
              disabled={isSubmitting}
            >
              <option value="">Select a user...</option>
              {tenantUsers.length === 0 ? (
                <option value="" disabled>No users found</option>
              ) : (
                tenantUsers.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.mail || u.email || u.name || `User ${u.id}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="limit_date" className="block text-sm font-medium text-[#0c272d] mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Due Date</span>
              </div>
            </label>
            <input
              type="date"
              id="limit_date"
              value={formData.limit_date}
              onChange={(e) => handleInputChange('limit_date', e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#9fdbc2]/20">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-[#0c272d]/60 hover:text-[#0c272d] hover:bg-gray-100 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-6 py-3 bg-[#14a67e] text-white rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{mode === 'create' ? 'Create Task' : 'Update Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
