'use client';

import React, { useState, useEffect } from 'react';
import {
  X, 
  Calendar, 
  User, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Square
} from 'lucide-react';
import type { Task, TimeEntry, CreateTimeEntryRequest } from '@/lib/types/task-types';
import { 
  useUpdateTask, 
  useDeleteTask, 
  useSubtasks, 
  useTimeEntries, 
  useCreateTimeEntry,
  useDeleteTimeEntry 
} from '@/lib/hooks/use-tasks';
import { 
  getTaskStateColor, 
  getTaskPriorityColor, 
  getTaskPriorityIcon,
  formatDueDate,
  isTaskOverdue,
  formatDuration,
  parseAssignedUserIds
} from '@/lib/tasks/utils';
import TaskModal from './TaskModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: () => void;
  onDelete: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [currentTimerDescription, setCurrentTimerDescription] = useState('');

  const { updateTask, loading: updating } = useUpdateTask();
  const { deleteTask, loading: deleting } = useDeleteTask();
  const { subtasks, loading: loadingSubtasks } = useSubtasks(task?.task_id || 0);
  const { timeEntries, totalHours, loading: loadingTimeEntries, refetch: refetchTimeEntries } = useTimeEntries(task?.task_id || 0);
  const { createTimeEntry, loading: creatingTimeEntry } = useCreateTimeEntry();
  const { deleteTimeEntry, loading: deletingTimeEntry } = useDeleteTimeEntry();

  // Timer functionality
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - timerStartTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimerDisplay(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerStartTime]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setTimerStartTime(new Date());
  };

  const handleStopTimer = async () => {
    if (!isTimerRunning || !timerStartTime || !task) return;

    setIsTimerRunning(false);
    
    const endTime = new Date();
    const startTime = timerStartTime;

    try {
      await createTimeEntry({
        task_id: task.task_id,
        user_id: 1, // TODO: Get from auth context
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        description: currentTimerDescription || 'Time tracked'
      });

      setTimerDisplay('00:00:00');
      setCurrentTimerDescription('');
      refetchTimeEntries();
    } catch (error) {
      console.error('Error creating time entry:', error);
    }
  };

  const handleDeleteTimeEntry = async (entryId: number) => {
    try {
      await deleteTimeEntry(entryId);
      refetchTimeEntries();
    } catch (error) {
      console.error('Error deleting time entry:', error);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    setIsEditing(false);
    onUpdate();
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(task.task_id);
        onDelete();
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleClose = () => {
    if (isTimerRunning) {
      if (window.confirm('Timer is running. Stop it before closing?')) {
        handleStopTimer();
      } else {
        return;
      }
    }
    onClose();
  };

  if (!isOpen || !task) return null;

  const stateColors = getTaskStateColor(task.state);
  const priorityColors = getTaskPriorityColor(task.priority);
  const priorityIcon = getTaskPriorityIcon(task.priority);
  const isOverdue = isTaskOverdue(task);
  const assignedUserIds = parseAssignedUserIds(task.assigned_to_ids);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#9fdbc2]/20">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-[#0c272d]">{task.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${stateColors}`}>
              {task.state}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${priorityColors}`}>
              {priorityIcon} {task.priority}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={updating || deleting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Edit task"
            >
              <Edit className="w-5 h-5 text-[#0c272d]/60" />
            </button>
            <button
              onClick={handleDeleteTask}
              disabled={updating || deleting}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              title="Delete task"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
            <button
              onClick={handleClose}
              disabled={updating || deleting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-[#0c272d]/60" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-[#0c272d] mb-2">Description</h3>
              <p className="text-[#0c272d]/70 bg-gray-50 rounded-lg p-4">{task.description}</p>
            </div>
          )}

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Due Date */}
              {task.limit_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-[#0c272d]/40'}`} />
                  <div>
                    <p className="text-sm font-medium text-[#0c272d]">Due Date</p>
                    <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-[#0c272d]/60'}`}>
                      {formatDueDate(task)}
                    </p>
                  </div>
                </div>
              )}

              {/* Assigned Users */}
              {assignedUserIds.length > 0 && (
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-[#0c272d]/40" />
                  <div>
                    <p className="text-sm font-medium text-[#0c272d]">Assigned To</p>
                    <div className="flex -space-x-2 mt-1">
                      {assignedUserIds.slice(0, 5).map((userId) => (
                        <div
                          key={userId}
                          className="w-8 h-8 bg-[#14a67e] rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium"
                        >
                          {userId}
                        </div>
                      ))}
                      {assignedUserIds.length > 5 && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-sm font-medium">
                          +{assignedUserIds.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Project Info */}
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-[#14a67e]/20 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#14a67e] rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0c272d]">Project</p>
                  <p className="text-sm text-[#0c272d]/60">ID: {task.proyect_id}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Time Tracking */}
            <div className="space-y-4">
              {/* Time Tracker */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-[#0c272d] mb-3">Time Tracking</h3>
                
                {/* Timer */}
                <div className="mb-4">
                  <div className="text-center mb-3">
                    <div className="text-2xl font-mono font-bold text-[#0c272d] mb-2">
                      {timerDisplay}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      {!isTimerRunning ? (
                        <button
                          onClick={handleStartTimer}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleStopTimer}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Square className="w-4 h-4" />
                          <span>Stop</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {isTimerRunning && (
                    <div>
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={currentTimerDescription}
                        onChange={(e) => setCurrentTimerDescription(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20"
                      />
                    </div>
                  )}
                </div>

                {/* Total Time */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#0c272d]/60">Total Time:</span>
                  <span className="font-medium text-[#0c272d]">{formatDuration(totalHours)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Entries */}
          {timeEntries.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#0c272d] mb-3">Time Entries</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {timeEntries.map((entry) => (
                  <div key={entry.time_entry_id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-[#0c272d]/40" />
                        <span className="font-medium text-[#0c272d]">
                          {formatDuration(entry.duration_hours || 0)}
                        </span>
                        <span className="text-[#0c272d]/60">
                          {new Date(entry.start_time).toISOString().split('T')[0]}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-[#0c272d]/60 mt-1">{entry.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTimeEntry(entry.time_entry_id)}
                      disabled={deletingTimeEntry}
                      className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                      title="Delete time entry"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#0c272d] mb-3">Subtasks</h3>
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.task_id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 text-[#0c272d]/40" />
                    <span className="flex-1 text-sm text-[#0c272d]">{subtask.title}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getTaskStateColor(subtask.state)}`}>
                      {subtask.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created/Updated Info */}
          <div className="pt-4 border-t border-[#9fdbc2]/20 text-xs text-[#0c272d]/60">
            <p>Created: {new Date(task.created_at).toISOString().split('T')[0]}</p>
            <p>Updated: {new Date(task.updated_at).toISOString().split('T')[0]}</p>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleUpdateTask}
        mode="edit"
        task={task}
      />
    </div>
  );
};

export default TaskDetailModal;
