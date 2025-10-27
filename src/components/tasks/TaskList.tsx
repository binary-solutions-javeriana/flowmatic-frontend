'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter, Calendar, User, Clock, X } from 'lucide-react';
import type { Task, TaskFilters, TaskState, TaskPriority } from '@/lib/types/task-types';
import { useProjectTasks } from '@/lib/hooks/use-tasks';
import { filterTasksBySearch, sortTasksByPriority, sortTasksByDueDate } from '@/lib/tasks/utils';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

interface TaskListProps {
  projectId: number;
  onTaskClick?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ projectId, onTaskClick }) => {
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 20
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskState | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [sortBy, setSortBy] = useState<'priority' | 'due_date' | 'created_at'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { tasks, pagination, loading, error, refetch } = useProjectTasks(projectId, filters);

  // Debounced search
  useEffect(() => {
    if (searchTerm === '' && statusFilter === '' && priorityFilter === '') {
      // If cleared, fetch immediately
      const defaultFilters: TaskFilters = {
        ...filters,
        page: 1,
        search: undefined,
        state: undefined,
        priority: undefined
      };
      setFilters(defaultFilters);
      refetch();
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, priorityFilter]);

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    const searchFilters: TaskFilters = {
      ...filters,
      page: 1,
      search: searchTerm.trim() || undefined,
      state: statusFilter || undefined,
      priority: priorityFilter || undefined
    };
    setFilters(searchFilters);
    refetch().finally(() => {
      setIsSearching(false);
    });
  }, [searchTerm, statusFilter, priorityFilter, filters, refetch]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    refetch();
  };

  const handleCreateTask = async () => {
    setIsCreateModalOpen(false);
    // Add a small delay to ensure the backend has processed the task
    setTimeout(() => {
      refetch();
    }, 200);
  };

  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // Filter and sort tasks on the client side for better UX
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply client-side filtering for better search experience
    if (searchTerm.trim()) {
      filtered = filterTasksBySearch(filtered, searchTerm);
    }

    // Apply sorting
    if (sortBy === 'priority') {
      filtered = sortTasksByPriority(filtered, sortOrder);
    } else if (sortBy === 'due_date') {
      filtered = sortTasksByDueDate(filtered, sortOrder);
    }

    return filtered;
  }, [tasks, searchTerm, sortBy, sortOrder]);

  if (loading && !tasks.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-medium text-lg mb-2">❌ Error loading tasks</h3>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0c272d]">Tasks</h2>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#14a67e] text-white px-4 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        mode="create"
        projectId={projectId}
      />

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-[#9fdbc2]/20 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${isSearching ? 'text-[#14a67e] animate-pulse' : 'text-[#0c272d]/40'}`} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0c272d]/40 hover:text-[#0c272d] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48 relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0c272d]/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskState | '')}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="w-full lg:w-48 relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
              className="w-full px-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-full lg:w-48 relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="w-full px-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="priority-asc">Priority (Low to High)</option>
              <option value="due_date-asc">Due Date (Earliest)</option>
              <option value="due_date-desc">Due Date (Latest)</option>
              <option value="created_at-desc">Created (Newest)</option>
              <option value="created_at-asc">Created (Oldest)</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter || priorityFilter) && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 whitespace-nowrap flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
        
        {/* Active Filters Display */}
        {(searchTerm || statusFilter || priorityFilter) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-[#14a67e]/10 text-[#14a67e] rounded-lg text-sm">
                <Search className="w-3 h-3" />
                <span>Search: &quot;{searchTerm}&quot;</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-[#14a67e]/70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                <Filter className="w-3 h-3" />
                <span>Status: {statusFilter}</span>
                <button onClick={() => setStatusFilter('')} className="hover:text-blue-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priorityFilter && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm">
                <span>Priority: {priorityFilter}</span>
                <button onClick={() => setPriorityFilter('')} className="hover:text-orange-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tasks Grid */}
      {filteredAndSortedTasks.length === 0 && !loading ? (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 border border-[#9fdbc2]/20 shadow-lg text-center">
          <div className="w-16 h-16 bg-[#14a67e]/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-[#14a67e]" />
          </div>
          <h3 className="text-xl font-semibold text-[#0c272d] mb-2">No tasks found</h3>
          <p className="text-[#0c272d]/60 mb-6">
            {searchTerm || statusFilter || priorityFilter ? 'Try adjusting your search criteria.' : 'Get started by creating your first task.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#14a67e] text-white px-6 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedTasks.map((task: Task) => (
              <TaskCard 
                key={task.task_id} 
                task={task} 
                onClick={() => handleTaskClick(task)}
                showProject={false}
              />
            ))}
          </div>

          {/* Results Count */}
          {filteredAndSortedTasks.length > 0 && (
            <div className="text-sm text-[#0c272d]/70 text-center">
              Showing {filteredAndSortedTasks.length} {filteredAndSortedTasks.length === 1 ? 'task' : 'tasks'}
              {searchTerm || statusFilter || priorityFilter ? ' matching your criteria' : ''}
            </div>
          )}

          {/* Pagination */}
          {pagination && (pagination.totalPages ?? 0) > 1 && !searchTerm && !statusFilter && !priorityFilter && (
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-[#9fdbc2]/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#0c272d]/70">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 text-sm bg-white/50 border border-[#9fdbc2]/30 rounded-lg hover:bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages ?? 1) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all ${
                          pagination.page === page
                            ? 'bg-[#14a67e] text-white'
                            : 'bg-white/50 border border-[#9fdbc2]/30 hover:bg-white/70'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= (pagination.totalPages ?? 1)}
                    className="px-3 py-2 text-sm bg-white/50 border border-[#9fdbc2]/30 rounded-lg hover:bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;
