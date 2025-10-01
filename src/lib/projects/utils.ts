import type { Project, ProjectState } from './types';
import type { Project as UIProject } from '@/components/dashboard/types';

/**
 * Adapts a backend project to UI project format
 */
export function adaptBackendProjectToUI(backendProject: Project, stats?: {
  totalTasks?: number;
  completedTasks?: number;
}): UIProject {
  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    id: backendProject.proyect_id,
    name: backendProject.name_proyect,
    status: backendProject.state,
    progress,
    dueDate: backendProject.end_date 
      ? new Date(backendProject.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'No date',
    team: 0, // TODO: Get from project users endpoint
    tasks: {
      total: totalTasks,
      completed: completedTasks,
    },
  };
}

/**
 * Gets the color classes for a project state
 */
export function getProjectStateColor(state?: ProjectState | string): string {
  switch (state) {
    case 'Planning':
      return 'bg-gray-100 text-gray-700';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'On Hold':
      return 'bg-yellow-100 text-yellow-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date?: string): string {
  if (!date) return 'No date';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculates project progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

