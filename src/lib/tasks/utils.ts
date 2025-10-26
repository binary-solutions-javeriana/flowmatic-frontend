import type { Task, TaskState, TaskPriority } from '../types/task-types';

// Task state colors for UI
export function getTaskStateColor(state: TaskState): string {
  switch (state) {
    case 'To Do':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Done':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Blocked':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Task priority colors for UI
export function getTaskPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'Low':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Critical':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// Task priority icons
export function getTaskPriorityIcon(priority: TaskPriority): string {
  switch (priority) {
    case 'Low':
      return '🔽';
    case 'Medium':
      return '🔼';
    case 'High':
      return '⬆️';
    case 'Critical':
      return '🚨';
    default:
      return '🔽';
  }
}

// Check if task is overdue
export function isTaskOverdue(task: Task): boolean {
  if (!task.limit_date) return false;
  const limitDate = new Date(task.limit_date);
  const now = new Date();
  return limitDate < now && task.state !== 'Done';
}

// Get days until due date
export function getDaysUntilDue(task: Task): number | null {
  if (!task.limit_date) return null;
  const limitDate = new Date(task.limit_date);
  const now = new Date();
  const diffTime = limitDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Format due date display
export function formatDueDate(task: Task): string {
  if (!task.limit_date) return 'No due date';
  
  const daysUntil = getDaysUntilDue(task);
  if (daysUntil === null) return 'No due date';
  
  const date = new Date(task.limit_date);
  // Use a consistent date format to avoid hydration issues
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  if (daysUntil < 0) {
    return `Overdue (${Math.abs(daysUntil)} days ago)`;
  } else if (daysUntil === 0) {
    return 'Due today';
  } else if (daysUntil === 1) {
    return 'Due tomorrow';
  } else if (daysUntil <= 7) {
    return `Due in ${daysUntil} days`;
  } else {
    return formattedDate;
  }
}

// Parse assigned user IDs from comma-separated string
export function parseAssignedUserIds(assignedToIds?: string): number[] {
  if (!assignedToIds) return [];
  return assignedToIds
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));
}

// Format assigned user IDs back to comma-separated string
export function formatAssignedUserIds(userIds: number[]): string {
  return userIds.join(',');
}

// Get task progress percentage based on subtasks
export function getTaskProgress(task: Task, subtasks: Task[] = []): number {
  if (subtasks.length === 0) {
    // If no subtasks, base progress on task state
    switch (task.state) {
      case 'To Do': return 0;
      case 'In Progress': return 50;
      case 'Done': return 100;
      case 'Blocked': return 25;
      default: return 0;
    }
  }
  
  const completedSubtasks = subtasks.filter(subtask => subtask.state === 'Done').length;
  return Math.round((completedSubtasks / subtasks.length) * 100);
}

// Calculate total time worked on task
export function calculateTotalTime(timeEntries: TimeEntry[]): number {
  return timeEntries.reduce((total, entry) => {
    return total + (entry.duration_hours || 0);
  }, 0);
}

// Format time duration for display
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
}

// Sort tasks by priority
export function sortTasksByPriority(tasks: Task[], order: 'asc' | 'desc' = 'desc'): Task[] {
  const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  
  return [...tasks].sort((a, b) => {
    const aPriority = priorityOrder[a.priority] || 0;
    const bPriority = priorityOrder[b.priority] || 0;
    
    return order === 'desc' ? bPriority - aPriority : aPriority - bPriority;
  });
}

// Sort tasks by due date
export function sortTasksByDueDate(tasks: Task[], order: 'asc' | 'desc' = 'asc'): Task[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.limit_date ? new Date(a.limit_date).getTime() : Number.MAX_SAFE_INTEGER;
    const bDate = b.limit_date ? new Date(b.limit_date).getTime() : Number.MAX_SAFE_INTEGER;
    
    return order === 'asc' ? aDate - bDate : bDate - aDate;
  });
}

// Filter tasks by search term
export function filterTasksBySearch(tasks: Task[], searchTerm: string): Task[] {
  if (!searchTerm.trim()) return tasks;
  
  const searchLower = searchTerm.toLowerCase();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(searchLower) ||
    (task.description && task.description.toLowerCase().includes(searchLower))
  );
}

// Get task statistics
export function getTaskStats(tasks: Task[]): {
  total: number;
  byState: Record<TaskState, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
} {
  const stats = {
    total: tasks.length,
    byState: {
      'To Do': 0,
      'In Progress': 0,
      'Done': 0,
      'Blocked': 0
    },
    byPriority: {
      'Low': 0,
      'Medium': 0,
      'High': 0,
      'Critical': 0
    },
    overdue: 0
  };
  
  tasks.forEach(task => {
    // Count by state
    stats.byState[task.state]++;
    
    // Count by priority
    stats.byPriority[task.priority]++;
    
    // Count overdue
    if (isTaskOverdue(task)) {
      stats.overdue++;
    }
  });
  
  return stats;
}

// Validate task data
export function validateTaskData(data: Partial<Task>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  if (data.limit_date) {
    const dueDate = new Date(data.limit_date);
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
