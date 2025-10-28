'use client';

import React from 'react';
import { Calendar, Clock, User, MoreVertical } from 'lucide-react';
import type { Task } from '@/lib/types/task-types';
import { 
  getTaskStateColor, 
  getTaskPriorityColor, 
  getTaskPriorityIcon,
  formatDueDate,
  isTaskOverdue,
  parseAssignedUserIds
} from '@/lib/tasks/utils';
import { formatDateSafe } from '../dashboard/utils';

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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stateColors}`}>
              {task.state}
            </span>
            <button onClick={handleMenuClick} className="text-[#0c272d]/40 hover:text-[#0c272d]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-[#0c272d]/60">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs ${priorityColors}`}>
              {priorityIcon} {task.priority}
            </span>
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
        <h3 className="font-semibold text-[#0c272d] text-base leading-tight flex-1 mr-2">
          {task.title}
        </h3>
        <button onClick={handleMenuClick} className="text-[#0c272d]/40 hover:text-[#0c272d] p-1">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      {task.description && (
        <p className="text-sm text-[#0c272d]/60 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="space-y-3">
        {/* Status and Priority */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stateColors}`}>
            {task.state}
          </span>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${priorityColors}`}>
            {priorityIcon} {task.priority}
          </span>
        </div>

        {/* Assigned Users */}
        {assignedUserIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[#0c272d]/40" />
            <div className="flex -space-x-2">
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
            <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-[#0c272d]/40'}`} />
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
