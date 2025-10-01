import type { LucideIcon } from 'lucide-react';
import type React from 'react';

export type Priority = 'High' | 'Medium' | 'Low';

export type Status = 'Completed' | 'In Progress' | 'Active' | (string & {});

export interface Project {
  id: number;
  name: string;
  status: Status;
  progress: number;
  dueDate: string;
  team: number;
  tasks: { total: number; completed: number };
}

export interface KanbanTask {
  id: number;
  title: string;
  priority: Priority;
  assignee: string;
  dueDate: string;
}

export type KanbanColumns = {
  todo: KanbanTask[];
  inProgress: KanbanTask[];
  completed: KanbanTask[];
};

export interface SidebarItem {
  id: string;
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active: boolean;
}

export interface CalendarTask {
  title: string;
  time: string;
  priority: Priority;
  color: string;
}

export type CalendarTasksByDay = Record<number, CalendarTask[]>;

