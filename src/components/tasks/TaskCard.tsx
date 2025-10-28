'use client';

import React, { useState } from 'react';
import { Calendar, Clock, User, MoreVertical, ChevronDown } from 'lucide-react';
import type { Task, TaskState, TaskPriority } from '@/lib/types/task-types';
import {
  getTaskStateColor,
  getTaskPriorityColor,
  getTaskPriorityIcon,
  formatDueDate,
  isTaskOverdue,
  parseAssignedUserIds
} from '@/lib/tasks/utils';
import { formatDateSafe } from '../dashboard/utils';
import { useUpdateTaskStatus, useUpdateTask } from '@/lib/hooks/use-tasks';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showProject?: boolean;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onEdit,
  onDelete,
  showProject = false,
  compact = false
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  const { updateTaskStatus } = useUpdateTaskStatus();
  const { updateTask } = useUpdateTask();

  const stateColors = getTaskStateColor(task.state);
  const priorityColors = getTaskPriorityColor(task.priority);
  const priorityIcon = getTaskPriorityIcon(task.priority);
  const isOverdue = isTaskOverdue(task);
  const assignedUserIds = parseAssignedUserIds(task.assigned_to_ids);

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement dropdown menu
  };

  const handleStatusChange = async (newState: TaskState) => {
    setUpdatingStatus(true);
    try {
      await updateTaskStatus(task.task_id, newState);
      // The task state will be updated via the parent component's refetch
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setUpdatingPriority(true);
    try {
      await updateTask(task.task_id, { priority: newPriority });
      // The task priority will be updated via the parent component's refetch
    } catch (error) {
      console.error('Error updating task priority:', error);
    } finally {
      setUpdatingPriority(false);
    }
  };

  if (compact) {
    return (
      <div 
        onClick={handleCardClick}
        className={`bg-white/60 backdrop-blur-lg rounded-xl p-3 border border-[#9fdbc2]/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
          isOverdue ? 'ring-2 ring-red-200' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-[#0c272d] text-sm truncate flex-1 mr-2">
            {task.title}
          </h4>
          <div className="flex items-center space-x-1">
            <div className="relative">
              <select
                value={task.state}
                onChange={(e) => handleStatusChange(e.target.value as TaskState)}
                disabled={updatingStatus}
                className={`px-2 py-1 rounded-full text-xs font-medium appearance-none cursor-pointer transition-all duration-200 ${stateColors} ${
                  updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                }`}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
            </div>
            <button onClick={handleMenuClick} className="text-[#0c272d]/40 hover:text-[#0c272d]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-[#0c272d]/60">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                disabled={updatingPriority}
                className={`px-2 py-1 rounded text-xs appearance-none cursor-pointer transition-all duration-200 ${priorityColors} ${
                  updatingPriority ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                }`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
            </div>
            {assignedUserIds.length > 0 && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{assignedUserIds.length}</span>
              </div>
            )}
          </div>
          {task.limit_date && (
            <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
              <Calendar className="w-3 h-3" />
              <span className={isOverdue ? 'font-medium' : ''}>
                {formatDueDate(task)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-[#9fdbc2]/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
        isOverdue ? 'ring-2 ring-red-200' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[#0c272d] text-base sm:text-lg leading-tight flex-1 mr-2">
          {task.title}
        </h3>
        <button onClick={handleMenuClick} className="text-[#0c272d]/40 hover:text-[#0c272d] p-1 flex-shrink-0">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {task.description && (
        <p className="text-sm sm:text-base text-[#0c272d]/60 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="space-y-3">
        {/* Status and Priority */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="relative">
            <select
              value={task.state}
              onChange={(e) => handleStatusChange(e.target.value as TaskState)}
              disabled={updatingStatus}
              className={`px-3 py-1 rounded-full text-xs font-medium w-fit appearance-none cursor-pointer transition-all duration-200 ${stateColors} ${
                updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
              }`}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
              disabled={updatingPriority}
              className={`px-3 py-1 rounded-lg text-xs font-medium w-fit appearance-none cursor-pointer transition-all duration-200 ${priorityColors} ${
                updatingPriority ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
              }`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
          </div>
        </div>

        {/* Assigned Users */}
        {assignedUserIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[#0c272d]/40 flex-shrink-0" />
            <div className="flex -space-x-2 overflow-hidden">
              {assignedUserIds.slice(0, 3).map((userId) => (
                <div
                  key={userId}
                  className="w-6 h-6 bg-[#14a67e] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                >
                  {userId}
                </div>
              ))}
              {assignedUserIds.length > 3 && (
                <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                  +{assignedUserIds.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Due Date */}
        {task.limit_date && (
          <div className={`flex items-center space-x-2 text-sm ${isOverdue ? 'text-red-600' : 'text-[#0c272d]/60'}`}>
            <Calendar className={`w-4 h-4 flex-shrink-0 ${isOverdue ? 'text-red-500' : 'text-[#0c272d]/40'}`} />
            <span className={isOverdue ? 'font-medium' : ''}>
              {formatDueDate(task)}
            </span>
          </div>
        )}

        {/* Project Info */}
        {showProject && (
          <div className="text-xs text-[#0c272d]/60 pt-2 border-t border-[#9fdbc2]/20">
            Project ID: {task.proyect_id}
          </div>
        )}
      </div>

      {/* Task Info */}
      <div className="mt-3 pt-3 border-t border-[#9fdbc2]/20 text-xs text-[#0c272d]/60">
      Task ID: {task.task_id}
      </div>
    </div>
  );
};

export default TaskCard;
