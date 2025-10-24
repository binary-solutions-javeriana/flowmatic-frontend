import type { Priority, Status } from './types';

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getStatusColor = (status: Status): string => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'Planning':
      return 'bg-gray-100 text-gray-700';
    case 'On Hold':
      return 'bg-yellow-100 text-yellow-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Safe date formatting utility
/**
 * Safely formats a date string to YYYY-MM-DD format
 * Returns 'Unknown' if the date is invalid or null/undefined
 */
export const formatDateSafe = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    return date.toISOString().split('T')[0];
  } catch {
    return 'Unknown';
  }
};

