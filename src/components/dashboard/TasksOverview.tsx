'use client';

import React, { useState, useEffect } from 'react';
import { 
  Kanban, 
  List, 
  ArrowRight,
  CheckSquare,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';
import type { Task } from '@/lib/types/task-types';
import { useProjects } from '@/lib/projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import TaskDetailModal from '../tasks/TaskDetailModal';
import TaskModal from '../tasks/TaskModal';

type ViewMode = 'kanban' | 'list';
type ProjectFilter = 'all' | number;

const TasksOverview: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedProject, setSelectedProject] = useState<ProjectFilter>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { projects, loading: projectsLoading, error: projectsError } = useProjects({ 
    page: 1, 
    limit: 100, 
    orderBy: 'created_at', 
    order: 'desc' 
  });

  // Fetch all tasks across all projects
  const { tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useTasks({
    page: 1,
    limit: 100
  });

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

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
  };

  const handleTaskDelete = () => {
    // Handle task deletion if needed
  };

  const handleCreateTask = (task: Task) => {
    // Task creation will be handled by the modal
    setIsCreateModalOpen(false);
    // Refresh tasks
    refetchTasks();
  };

  // Filter tasks by selected project
  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(task => task.proyect_id === selectedProject);

  const getTaskStats = () => {
    if (!filteredTasks || filteredTasks.length === 0) return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(task => task.state === 'Done').length;
    const inProgress = filteredTasks.filter(task => task.state === 'In Progress').length;
    const pending = filteredTasks.filter(task => task.state === 'To Do').length;

    return { total, completed, inProgress, pending };
  };

  const stats = getTaskStats();

  // Early return to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  if (projectsError || tasksError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-medium text-lg mb-2">❌ Error loading data</h3>
        <p className="text-sm mb-4">{projectsError || tasksError}</p>
        <button
          onClick={() => {
            if (projectsError) window.location.reload();
            if (tasksError) refetchTasks();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stats Cards with Controls */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg flex items-center justify-center min-h-[120px]">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-[#0c272d]/60 mb-1">Total Tasks</p>
                <p className="text-2xl font-bold text-[#0c272d]">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg flex items-center justify-center min-h-[120px]">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-[#0c272d]/60 mb-1">Completed</p>
                <p className="text-2xl font-bold text-[#0c272d]">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg flex items-center justify-center min-h-[120px]">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-[#0c272d]/60 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-[#0c272d]">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg flex items-center justify-center min-h-[120px]">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <AlertCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-[#0c272d]/60 mb-1">Pending</p>
                <p className="text-2xl font-bold text-[#0c272d]">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls - Triangle Layout */}
        <div className="flex flex-col items-center space-y-3 ml-6">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-lg rounded-xl p-1 border border-[#9fdbc2]/20">
            <button
              onClick={() => setViewMode('kanban')}
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
              onClick={() => setViewMode('list')}
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
          
          {/* Create Task Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#14a67e] text-white px-6 py-3 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Project Filter */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-[#9fdbc2]/20 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#0c272d]">Filter by Project</h3>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-2 bg-white/60 border border-[#9fdbc2]/20 rounded-lg text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20"
          >
            <option value="all">All Projects</option>
            {projects?.map((project) => (
              <option key={project.proyect_id} value={project.proyect_id}>
                {project.name_proyect}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content - Tasks View */}
      <div className="min-h-[600px]">
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['To Do', 'In Progress', 'Done', 'Cancelled'].map((state) => {
              const stateTasks = filteredTasks.filter(task => task.state === state);
              return (
                <div
                  key={state}
                  className={`rounded-2xl border-2 border-dashed transition-all duration-300 ${
                    state === 'To Do' ? 'bg-gray-50 border-gray-200' :
                    state === 'In Progress' ? 'bg-blue-50 border-blue-200' :
                    state === 'Done' ? 'bg-green-50 border-green-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#0c272d] flex items-center space-x-2">
                        <span>{state}</span>
                        <span className="bg-white/60 text-[#0c272d]/60 px-2 py-1 rounded-full text-xs font-medium">
                          {stateTasks.length}
                        </span>
                      </h3>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="p-4 space-y-3 min-h-[400px]">
                    {stateTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-[#0c272d]/40">
                        <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center mb-2">
                          <CheckSquare className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-center">No tasks</p>
                      </div>
                    ) : (
                      stateTasks.map((task) => (
                        <div
                          key={task.task_id}
                          className="cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="bg-white/60 backdrop-blur-lg rounded-xl p-3 border border-[#9fdbc2]/20 shadow-sm hover:shadow-md transition-all duration-200">
                            <h4 className="font-medium text-[#0c272d] text-sm mb-1 line-clamp-2">
                              {task.title}
                            </h4>
                            <p className="text-xs text-[#0c272d]/60 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs px-2 py-1 bg-[#14a67e]/10 text-[#14a67e] rounded-full">
                                {task.priority || 'Medium'}
                              </span>
                              {task.limit_date && (
                                <span className="text-xs text-[#0c272d]/60">
                                  {new Date(task.limit_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 border border-[#9fdbc2]/20 shadow-lg text-center">
                <CheckSquare className="w-12 h-12 text-[#0c272d]/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#0c272d] mb-2">No tasks found</h3>
                <p className="text-[#0c272d]/60">No tasks match your current filter.</p>
              </div>
            ) : (
              ['To Do', 'In Progress', 'Done', 'Cancelled'].map((state) => {
                const stateTasks = filteredTasks.filter(task => task.state === state);
                if (stateTasks.length === 0) return null;
                
                return (
                  <div key={state} className="space-y-3">
                    {/* State Header */}
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-[#0c272d]">{state}</h3>
                      <span className="px-2 py-1 bg-[#14a67e]/10 text-[#14a67e] rounded-full text-sm font-medium">
                        {stateTasks.length}
                      </span>
                    </div>
                    
                    {/* Tasks in this state */}
                    <div className="space-y-2">
                      {stateTasks.map((task) => (
                        <div
                          key={task.task_id}
                          onClick={() => handleTaskClick(task)}
                          className="bg-white/60 backdrop-blur-lg rounded-lg p-3 border border-[#9fdbc2]/20 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-[#0c272d] text-sm mb-1">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-[#0c272d]/60 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                                  {task.priority || 'Medium'}
                                </span>
                                {task.limit_date && (
                                  <span className="text-xs text-[#0c272d]/60">
                                    Due: {new Date(task.limit_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#0c272d]/40" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        mode="create"
        projectId={selectedProject !== 'all' ? selectedProject : undefined}
      />
    </div>
  );
};

export default TasksOverview;
