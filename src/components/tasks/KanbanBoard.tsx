'use client';

import React, { useState, useCallback } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import type { Task, TaskState, KanbanBoard } from '@/lib/types/task-types';
import { useKanbanBoard, useUpdateTaskStatus, useCreateTask } from '@/lib/hooks/use-tasks';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

interface KanbanBoardProps {
  projectId: number;
  onTaskClick?: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, onTaskClick }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<TaskState | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const { kanbanBoard, loading, error, refetch, forceRefresh } = useKanbanBoard(projectId);
  const { updateTaskStatus } = useUpdateTaskStatus();
  const { createTask } = useCreateTask();

  // Column configurations
  const columns: { id: TaskState; title: string; color: string }[] = [
    { id: 'To Do', title: 'To Do', color: 'bg-gray-50 border-gray-200' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'Done', title: 'Done', color: 'bg-green-50 border-green-200' },
    { id: 'Cancelled', title: 'Cancelled', color: 'bg-red-50 border-red-200' }
  ];

  const handleTaskClick = useCallback((task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  }, [onTaskClick]);

  const handleCreateTask = useCallback(async (taskData: any) => {
    // TaskModal already created the task, we just need to refresh the view
    setIsCreateModalOpen(false);
    setSelectedColumn(null);
    // Force a refresh with a small delay to ensure the backend has processed the task
    setTimeout(() => {
      forceRefresh();
    }, 200);
  }, [forceRefresh]);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetState: TaskState) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.state === targetState) {
      setDraggedTask(null);
      return;
    }

    try {
      await updateTaskStatus(draggedTask.task_id, targetState);
      forceRefresh();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setDraggedTask(null);
    }
  }, [draggedTask, updateTaskStatus, forceRefresh]);

  const handleColumnAddTask = useCallback((columnId: TaskState) => {
    setSelectedColumn(columnId);
    setIsCreateModalOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-medium text-lg mb-2">❌ Error loading Kanban board</h3>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={forceRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!kanbanBoard) {
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 border border-[#9fdbc2]/20 shadow-lg text-center">
        <h3 className="text-xl font-semibold text-[#0c272d] mb-2">No Kanban board found</h3>
        <p className="text-[#0c272d]/60">Unable to load the Kanban board for this project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0c272d]">Kanban Board</h2>
          <p className="text-[#0c272d]/60">{kanbanBoard.project_name}</p>
        </div>
        <button
          onClick={() => handleColumnAddTask('To Do')}
          className="bg-[#14a67e] text-white px-4 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const tasks = kanbanBoard.columns[column.id] || [];
          
          return (
            <div
              key={column.id}
              className={`rounded-2xl border-2 border-dashed transition-all duration-300 ${column.color} ${
                draggedTask && draggedTask.state !== column.id
                  ? 'border-[#14a67e] bg-[#14a67e]/5'
                  : 'border-gray-200'
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#0c272d] flex items-center space-x-2">
                    <span>{column.title}</span>
                    <span className="bg-white/60 text-[#0c272d]/60 px-2 py-1 rounded-full text-xs font-medium">
                      {tasks.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => handleColumnAddTask(column.id)}
                    className="p-1 hover:bg-white/60 rounded-lg transition-colors text-[#0c272d]/40 hover:text-[#0c272d]"
                    title={`Add task to ${column.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-3 min-h-[400px]">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-[#0c272d]/40">
                    <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center mb-2">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-center">No tasks</p>
                    <button
                      onClick={() => handleColumnAddTask(column.id)}
                      className="text-xs text-[#14a67e] hover:underline mt-1"
                    >
                      Add task
                    </button>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.task_id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="cursor-move"
                    >
                      <TaskCard
                        task={task}
                        onClick={() => handleTaskClick(task)}
                        compact
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedColumn(null);
        }}
        onSubmit={handleCreateTask}
        mode="create"
        projectId={projectId}
        initialState={selectedColumn || 'To Do'}
      />
    </div>
  );
};

export default KanbanBoard;
