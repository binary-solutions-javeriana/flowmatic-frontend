// Task-related types based on the API documentation

export type TaskState = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  task_id: number;
  proyect_id: number;
  title: string;
  description?: string;
  state: TaskState;
  priority: TaskPriority;
  created_by: number;
  assigned_to_ids?: string | number[]; // Comma-separated user IDs: "2,3,4"
  limit_date?: string; // ISO 8601 date
  parent_task_id?: number; // For subtasks
}

export interface CreateTaskRequest {
  proyect_id?: number; // Optional when creating via project endpoint
  parent_task_id?: number; // For subtasks
  title: string;
  description?: string;
  state?: TaskState;
  priority: TaskPriority;
  created_by: number;
  assigned_to_ids?: number[] | string;
  assignee_user_id?: number;
  limit_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  state?: TaskState;
  priority?: TaskPriority;
  assigned_to_ids?: number[] | string;
  limit_date?: string;
}

export interface TasksResponse {
  data: Task[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  state?: TaskState;
  priority?: TaskPriority;
  assigned_to?: string;
  project_id?: number;
  orderBy?: 'title' | 'priority' | 'limit_date';
  order?: 'asc' | 'desc';
}

// Kanban Board Types
export interface KanbanBoard {
  project_id: number;
  project_name: string;
  columns: {
    'To Do': Task[];
    'In Progress': Task[];
    'Done': Task[];
  };
}

export interface KanbanColumn {
  id: TaskState;
  title: string;
  tasks: Task[];
  color: string;
}

// Time Tracking Types
export interface TimeEntry {
  time_entry_id: number;
  task_id: number;
  user_id: number;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  description?: string;
  duration_hours?: number;
  created_at: string;
}

export interface CreateTimeEntryRequest {
  task_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  description?: string;
}

export interface TimeEntriesResponse {
  data: TimeEntry[];
  total_hours: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Assignment Types
export interface AssignUsersRequest {
  user_ids: number[];
  notification_message?: string;
}

export interface AssignUsersResponse {
  message: string;
  task_id: number;
  assigned_users: number[];
}

// Subtask Types
export interface SubtasksResponse {
  data: Task[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Utility Types
export interface TaskStats {
  total: number;
  by_state: Record<TaskState, number>;
  by_priority: Record<TaskPriority, number>;
  overdue: number;
}

// User assignment helpers
export interface AssignedUser {
  id: number;
  name: string;
  avatar?: string;
}

export interface TaskWithAssignees extends Task {
  assigned_users?: AssignedUser[];
}
