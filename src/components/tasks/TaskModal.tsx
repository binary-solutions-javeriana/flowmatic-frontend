'use client';

import React, { useState, useLayoutEffect } from 'react';
import { X, Calendar, User, AlertCircle, Plus } from 'lucide-react';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskState, TaskPriority } from '@/lib/types/task-types';
import { useCreateTask, useUpdateTask } from '@/lib/hooks/use-tasks';
import { useProjects } from '@/lib/hooks/use-projects';
import { validateTaskData } from '@/lib/tasks/utils';
import { formatDateSafe } from '../dashboard/utils';
import { useAuthState } from '@/lib/auth-store';
import { authApi } from '@/lib/authenticated-api';

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
    priority: 'Medium' as TaskPriority,
    assigned_to_ids: '', // will be replaced by select of users
    limit_date: '',
    project_id: ''
  });
  const [tenantUsers, setTenantUsers] = useState<Array<{ id: number; email?: string; mail?: string; name?: string }>>([]);
  const [assigneeUserIds, setAssigneeUserIds] = useState<number[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const { user } = useAuthState();
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTask, loading: creating, error: createError } = useCreateTask();
  const { updateTask, loading: updating, error: updateError } = useUpdateTask();
  const { projects, loading: projectsLoading } = useProjects({ page: 1, limit: 100 });

  const setDateSafely = (isoDate: string) => {
    setFormData(prev => ({ ...prev, limit_date: isoDate || '' }));
  };

  const getProjectById = (pid?: number | string) => {
    if (!pid && pid !== 0) return null;
    const n = Number(pid);
    if (Number.isNaN(n)) return null;
    return (
      projects?.find(p => Number((p as any).proyect_id ?? (p as any).project_id) === n) || null
    );
  };

  const loadAssignableUsers = async (pid?: number) => {
      try {
        let res: any;

        if (pid) {
          // ✅ Usuarios vinculados al proyecto
          res = await authApi.get(`/projects/${pid}/users?page=1&limit=200`);
        } else {
          // Fallback actual (creatorMail / tenant) por compatibilidad
          const creatorMail = user?.email;
          const tenantId = (user as any)?.user_metadata?.tenantId || (user as any)?.tenantId;

          if (creatorMail) {
            res = await authApi.get(`/tasks/assignee-options?creatorMail=${encodeURIComponent(creatorMail)}`);
          } else if (tenantId) {
            res = await authApi.get(`/tasks/assignee-options/by-tenant?tenantId=${encodeURIComponent(String(tenantId))}`);
          } else {
            res = await authApi.get(`/tasks/assignee-options`);
          }
        }

        // Normaliza formatos posibles de la respuesta
        const arr = Array.isArray(res) ? res : (res?.items || res?.data || res?.users || []);
        const normalized = (arr || [])
          .map((u: any) => {
            const id =
              Number(u.UserID ?? u.user_id ?? u.id);

            // Captura variantes comunes de email/nombre que suelen venir del back
            const email =
              u.email ?? u.Email ?? u.user_email ?? u.UserEmail ?? u.mail ?? u.Mail ?? u.user_mail ?? u.UserMail ?? u.correo ?? u.Correo;

            const name =
              u.name ?? u.fullName ?? u.FullName ?? u.displayName ?? u.DisplayName ?? u.username ?? u.UserName ?? u.Nombre;

            return {
              id,
              // guarda ambos campos por compatibilidad con tu UI actual
              email: typeof email === 'string' ? email : undefined,
              mail: typeof email === 'string' ? email : undefined,
              name: typeof name === 'string' ? name : undefined,
            };
          })
          .filter((u: any) => Number.isFinite(u.id));

        setTenantUsers(normalized);
      } catch (e) {
        console.warn('Failed to load assignee options', e);
        setTenantUsers([]);
      }
    };

  const getProjectDates = (p: any) => {
    if (!p) return { start: '', end: '' };
    const start =
      p.start_date ?? p.StartDate ?? p.startDate ?? '';
    const end =
      p.end_date ?? p.EndDate ?? p.endDate ?? '';
    return { start, end };
  };


  const toNumberArray = (val: unknown): number[] => {
    if (Array.isArray(val)) return val.map((x) => Number(x)).filter((x) => !Number.isNaN(x));
    if (typeof val === 'string') {
      const s = val.trim();
      if (!s) return [];
      return s.split(',').map((p) => Number(p.trim())).filter((x) => !Number.isNaN(x));
    }
    if (val == null) return [];
    const n = Number(val);
    return Number.isNaN(n) ? [] : [n];
  };

  const toDateOnlyISO = (value?: string | Date) => {
    if (!value) return '';
    let s = typeof value === 'string' ? value : new Date(value).toISOString();
    // Soporta “YYYY-MM”
    if (/^\d{4}[-/]\d{2}$/.test(s)) s = s.replace('/', '-') + '-01';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return '';
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const isWithin = (v: string, min?: string, max?: string) => {
    if (!v) return true;
    if (min && v < min) return false;
    if (max && v > max) return false;
    return true;
  };

  const pickLimitDate = (t: any): string | undefined =>
    t?.limit_date ?? t?.LimitDate ?? t?.limitDate ?? undefined;

  const toInputDate = (value?: string | Date): string => {
    if (!value) return '';

    // Si ya es string YYYY-MM-DD, devuélvelo tal cual (sin tocar zona horaria)
    if (typeof value === 'string') {
      const s = value.trim().replace(/\//g, '-');
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;        // YYYY-MM-DD
      if (/^\d{4}-\d{2}$/.test(s))   return `${s}-01`;    // YYYY-MM -> primer día del mes

      // Si viene con tiempo (tiene 'T'), ajusta a local sin cambiar de día
      if (s.includes('T')) {
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return '';
        const tz = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tz).toISOString().slice(0, 10);
      }

      // Cualquier otro formato raro, intenta parsear y ajustar
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return '';
      const tz = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tz).toISOString().slice(0, 10);
    }

    // Si es objeto Date
    const d = value as Date;
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  };


  // Initialize form data and fetch tenant users
  useLayoutEffect(() => {
    const initialPid =
      (mode === 'edit' && task?.proyect_id)
        ? Number(task.proyect_id)
        : (projectId ? Number(projectId) : undefined);    

    loadAssignableUsers(initialPid);

    if (mode === 'edit' && task) {
      // 1) Fecha de la BD
      const isoFromTask = toInputDate(pickLimitDate(task)); // YYYY-MM-DD

      // 2) Fallback: fecha del proyecto (si aplica)
      let fallbackFromProject = '';
      const projectFromTask = task?.proyect_id
        ? projects?.find(p => p.proyect_id === task.proyect_id)
        : null;
      if (!isoFromTask && projectFromTask?.end_date) {
        fallbackFromProject = toInputDate(projectFromTask.end_date);
      }

      // 3) Cargar datos y fecha en el estado
      setFormData(prev => ({
        ...prev,
        title: task.title,
        description: task.description || '',
        state: task.state,
        priority: (task.priority as any) || 'Medium',
        assigned_to_ids: Array.isArray(task.assigned_to_ids)
          ? task.assigned_to_ids.join(',')
          : (task.assigned_to_ids || ''),
        project_id: String(task.proyect_id ?? (task as any).project_id ?? projectId ?? '')
        // importante: aquí NO pongas directamente la fecha; usa setDateSafely abajo
      }));
      setDateSafely(isoFromTask || fallbackFromProject); // <- única fuente: formData.limit_date

      (async () => {
        try {
          const assignees = await authApi.get<Array<{ TaskID: number; UserID: number }>>(
            `/tasks/${task.task_id}/assignees`
          );
          const ids = Array.isArray(assignees) ? assignees.map(a => Number(a.UserID)) : [];
          setAssigneeUserIds(ids.length ? ids : toNumberArray(task.assigned_to_ids));
        } catch {
          setAssigneeUserIds(toNumberArray(task.assigned_to_ids));
        }
      })();
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
      setAssigneeUserIds(user?.id ? [Number(user.id)] : []);
      setDateSafely('');
    }

    setErrors([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, task, isOpen, initialState, projectId, user, projects]);

  useLayoutEffect(() => {
    const pid = formData.project_id ? parseInt(formData.project_id) : projectId;
    loadAssignableUsers(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.project_id]);


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
      // Get project dates for validation
      let projectStartDate: string | undefined;
      let projectEndDate: string | undefined;

      const selectedProjectId = formData.project_id ? parseInt(formData.project_id) : projectId;
      if (selectedProjectId) {
        const selectedProject = projects?.find(p => p.proyect_id === selectedProjectId);
        if (selectedProject) {
          projectStartDate = selectedProject.start_date;
          projectEndDate = selectedProject.end_date;
        }
      }

      // Validate form data with project dates
      const validation = validateTaskData({
        ...formData,
        assigned_to_ids: assigneeUserIds
      }, projectStartDate, projectEndDate);
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
          ...(parentTaskId && { parent_task_id: parentTaskId }),
          assigned_to_ids: assigneeUserIds
        };

        result = await createTask(createData);
      } else if (mode === 'edit' && task) {
        const updateData: UpdateTaskRequest = {
          title: formData.title,
          description: formData.description || undefined,
          state: formData.state,
          priority: (formData.priority as any) as TaskPriority,
          assigned_to_ids: assigneeUserIds,
          limit_date: formData.limit_date || undefined
        };

        result = await updateTask(task.task_id, updateData);
      }

      if (result) {
        const normalized = {
          ...(task ?? {}),    // conserva ids/campos existentes si result viene parcial
          ...result,
          limit_date: formData.limit_date || result.limit_date || (task as any)?.limit_date || ''
        };
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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#9fdbc2]/20">
          <h2 className="text-lg sm:text-xl font-bold text-[#0c272d]">
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
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

          {/* Assigned Users (Tenant-scoped, multi-select with checkboxes) */}
          <div>
            <label className="block text-sm font-medium text-[#0c272d] mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Assign To *</span>
              </div>
            </label>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search users..."
              value={assigneeSearch}
              onChange={(e) => setAssigneeSearch(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300 mb-2"
              disabled={isSubmitting}
            />

            {/* Scrollable Checkbox List */}
            <div className="max-h-48 overflow-y-auto border border-[#9fdbc2]/30 rounded-xl bg-white/50">
              {tenantUsers.length === 0 ? (
                <div className="p-4 text-center text-[#0c272d]/60">No users found</div>
              ) : (
                tenantUsers
                  .filter((u) => {
                    const displayName = u.mail || u.email || u.name || `User ${u.id}`;
                    return displayName.toLowerCase().includes(assigneeSearch.toLowerCase());
                  })
                  .map((u) => {
                    const displayName = u.mail || u.email || u.name || `User ${u.id}`;
                    const isChecked = assigneeUserIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center space-x-3 p-3 hover:bg-[#9fdbc2]/10 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssigneeUserIds(prev => [...prev, u.id]);
                            } else {
                              setAssigneeUserIds(prev => prev.filter(id => id !== u.id));
                            }
                          }}
                          disabled={isSubmitting}
                          className="w-4 h-4 text-[#14a67e] border-[#9fdbc2]/30 rounded focus:ring-[#14a67e]/20"
                        />
                        <span className="text-[#0c272d] text-sm">{displayName}</span>
                      </label>
                    );
                  })
              )}
            </div>

            {/* Selected count */}
            {assigneeUserIds.length > 0 && (
              <div className="mt-2 text-xs text-[#0c272d]/70">
                {assigneeUserIds.length} user{assigneeUserIds.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="limit_date" className="block text-sm font-medium text-[#0c272d] mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Due Date *</span>
              </div>
            </label>
            
            {/* Project dates text */}
            {(() => {
            // 1) identificar el proyecto de referencia
            let projectForDates: any = null;
            let selectedProjectId: number | undefined;

            if (mode === 'edit' && task?.proyect_id) {
              selectedProjectId = task.proyect_id;
              projectForDates = projects?.find(p => p.proyect_id === task.proyect_id) || null;
            } else {
              selectedProjectId = formData.project_id ? parseInt(formData.project_id) : projectId;
              projectForDates = selectedProjectId ? projects?.find(p => p.proyect_id === selectedProjectId) : null;
            }

            // 2) calcular min/max (en formato YYYY-MM-DD para <input type="date">)
            const minDate = projectForDates?.start_date ? toInputDate(projectForDates.start_date) : '';
            const maxDate = projectForDates?.end_date ? toInputDate(projectForDates.end_date) : '';

            // Si el valor actual está fuera del rango, NO apliques min/max (para no limpiar el valor)
            const valueOk = isWithin(formData.limit_date, minDate || undefined, maxDate || undefined);
            const finalMin = valueOk ? (minDate || undefined) : undefined;
            const finalMax = valueOk ? (maxDate || undefined) : undefined;

            return (
              <>
                {projectForDates && (projectForDates.start_date || projectForDates.end_date) && (
                  <div className="text-xs text-[#0c272d]/70 mb-2">
                    Project dates: {projectForDates.start_date ? formatDateSafe(projectForDates.start_date) : 'N/A'} - {projectForDates.end_date ? formatDateSafe(projectForDates.end_date) : 'N/A'}
                  </div>
                )}

                <input
                  key={`date-${task?.task_id ?? 'new'}-${finalMin ?? 'nomin'}-${finalMax ?? 'nomax'}-${formData.limit_date || 'empty'}`}
                  type="date"
                  id="limit_date"
                  value={formData.limit_date}
                  onChange={(e) => setDateSafely(e.target.value)}
                  min={finalMin}
                  max={finalMax}
                  className="w-full px-4 py-3 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300"
                />
              </>
            );
            })()}

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
