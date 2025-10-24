'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Kanban, 
  List, 
  Calendar, 
  Plus,
  ArrowLeft,
  Settings
} from 'lucide-react';
import type { Task } from '@/lib/types/task-types';
import { useProject } from '@/lib/hooks/use-projects';
import KanbanBoard from './KanbanBoard';
import TaskList from './TaskList';
import TaskDetailModal from './TaskDetailModal';
import { formatDateSafe } from '../dashboard/utils';

interface TasksViewProps {
  projectId: number;
}

type ViewMode = 'kanban' | 'list';

const TasksView: React.FC<TasksViewProps> = ({ projectId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { project, loading: projectLoading, error: projectError } = useProject(projectId);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle URL parameters for view mode
  useEffect(() => {
    if (!isClient) return;
    
    const mode = searchParams.get('view') as ViewMode;
    if (mode === 'kanban' || mode === 'list') {
      setViewMode(mode);
    }
  }, [searchParams, isClient]);

  // Early return to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Update URL without causing a page refresh
    if (isClient) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('view', mode);
      router.push(`/dashboard/projects/${projectId}/tasks?${newSearchParams.toString()}`, { scroll: false });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = () => {
    // Tasks will be refreshed automatically by their respective components
    // This is just for any additional actions needed after update
  };

  const handleTaskDelete = () => {
    // Navigate back to projects list or handle as needed
    router.push('/dashboard/projects');
  };

  const handleBackToProjects = () => {
    router.push('/dashboard/projects');
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-medium text-lg mb-2">❌ Error loading project</h3>
        <p className="text-sm mb-4">{projectError}</p>
        <button
          onClick={handleBackToProjects}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 border border-[#9fdbc2]/20 shadow-lg text-center">
        <h3 className="text-xl font-semibold text-[#0c272d] mb-2">Project not found</h3>
        <p className="text-[#0c272d]/60 mb-6">The requested project could not be found.</p>
        <button
          onClick={handleBackToProjects}
          className="bg-[#14a67e] text-white px-6 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToProjects}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to projects"
          >
            <ArrowLeft className="w-5 h-5 text-[#0c272d]/60" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0c272d]">{project.name_proyect}</h1>
            <p className="text-[#0c272d]/60">Task Management</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-lg rounded-xl p-1 border border-[#9fdbc2]/20">
          <button
            onClick={() => handleViewModeChange('kanban')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              viewMode === 'kanban'
                ? 'bg-[#14a67e] text-white shadow-md'
                : 'text-[#0c272d]/60 hover:text-[#0c272d] hover:bg-white/50'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              viewMode === 'list'
                ? 'bg-[#14a67e] text-white shadow-md'
                : 'text-[#0c272d]/60 hover:text-[#0c272d] hover:bg-white/50'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Project Info Bar */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-[#9fdbc2]/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#14a67e] rounded-full"></div>
              <span className="text-sm font-medium text-[#0c272d]">Status: {project.state}</span>
            </div>
            {project.type && (
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                  {project.type}
                </span>
              </div>
            )}
            {project.start_date && (
              <div className="flex items-center space-x-2 text-sm text-[#0c272d]/60">
                <Calendar className="w-4 h-4" />
                <span>Started: {formatDateSafe(project.start_date)}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Project Settings</span>
          </button>
        </div>
        
        {project.description && (
          <div className="mt-3 pt-3 border-t border-[#9fdbc2]/20">
            <p className="text-sm text-[#0c272d]/70">{project.description}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {viewMode === 'kanban' ? (
          <KanbanBoard 
            projectId={projectId} 
            onTaskClick={handleTaskClick}
          />
        ) : (
          <TaskList 
            projectId={projectId} 
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        task={selectedTask}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
    </div>
  );
};

export default TasksView;
