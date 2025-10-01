'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Calendar, X, Filter } from 'lucide-react';
import { useProjects } from '@/lib/hooks/use-projects';
import type { ProjectFilters, Project } from '@/lib/types/project-types';
import ProjectModal from './ProjectModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import { getProjectStateColor } from '@/lib/projects/utils';

const ProjectsList: React.FC = () => {
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12
  });
  
  const { projects, pagination, loading, error, fetchProjects } = useProjects(filters);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    if (searchTerm === '' && statusFilter === '') {
      // If cleared, fetch immediately
      const defaultFilters: ProjectFilters = {
        ...filters,
        page: 1,
        search: undefined,
        status: undefined
      };
      setFilters(defaultFilters);
      fetchProjects(defaultFilters);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    const searchFilters: ProjectFilters = {
      ...filters,
      page: 1,
      search: searchTerm.trim() || undefined,
      status: statusFilter || undefined
    };
    setFilters(searchFilters);
    fetchProjects(searchFilters).finally(() => {
      setIsSearching(false);
    });
  }, [searchTerm, statusFilter, filters, fetchProjects]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchProjects(newFilters);
  };

  const handleCreateProject = async () => {
    // The modal will handle creation through the hook
    setIsModalOpen(false);
    // Refresh projects list
    await fetchProjects(filters);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedProject(null);
  };

  const handleProjectUpdate = () => {
    // Refresh projects list after update or delete
    fetchProjects(filters);
  };

  // Filter projects on the client side to ensure accurate search results
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(project => 
        project.name_proyect.toLowerCase().includes(searchLower) ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.type && project.type.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(project => project.state === statusFilter);
    }

    return filtered;
  }, [projects, searchTerm, statusFilter]);

  if (loading && !projects.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        <h3 className="font-medium">Error loading projects</h3>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => fetchProjects()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"
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
        <h2 className="text-2xl font-bold text-[#0c272d]">All Projects</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#14a67e] text-white px-4 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        mode="create"
      />

      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        project={selectedProject}
        onUpdate={handleProjectUpdate}
      />

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-[#9fdbc2]/20 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${isSearching ? 'text-[#14a67e] animate-pulse' : 'text-[#0c272d]/40'}`} />
            <input
              type="text"
              placeholder="Search by project name..."
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
          <div className="w-full md:w-56 relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0c272d]/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-[#9fdbc2]/30 rounded-xl text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-[#14a67e]/20 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0c272d]/40 hover:text-[#0c272d] transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {(searchTerm || statusFilter) && (
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
        {(searchTerm || statusFilter) && (
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
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 && !loading ? (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 border border-[#9fdbc2]/20 shadow-lg text-center">
          <div className="w-16 h-16 bg-[#14a67e]/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-[#14a67e]" />
          </div>
          <h3 className="text-xl font-semibold text-[#0c272d] mb-2">No projects found</h3>
          <p className="text-[#0c272d]/60 mb-6">
            {searchTerm || statusFilter ? 'Try adjusting your search criteria.' : 'Get started by creating your first project.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#14a67e] text-white px-6 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: Project) => (
              <ProjectCard 
                key={project.proyect_id} 
                project={project} 
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>

          {/* Results Count */}
          {filteredProjects.length > 0 && (
            <div className="text-sm text-[#0c272d]/70 text-center">
              Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              {searchTerm || statusFilter ? ' matching your criteria' : ''}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && !searchTerm && !statusFilter && (
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
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                    disabled={pagination.page >= pagination.totalPages}
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

// Project Card Component adapted to new design
const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const statusColors = getProjectStateColor(project.state);
  
  return (
    <div 
      onClick={onClick}
      className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#0c272d] truncate flex-1 mr-2">{project.name_proyect}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors}`}>
          {project.state}
        </span>
      </div>
      
      {project.description && (
        <p className="text-sm text-[#0c272d]/60 mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="space-y-3">
        {project.type && (
          <div className="flex items-center text-xs text-[#0c272d]/60">
            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
              {project.type}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-[#0c272d]/60">
          {project.start_date && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
            </div>
          )}
          {project.end_date && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Due: {new Date(project.end_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#9fdbc2]/20 text-xs text-[#0c272d]/60">
        Updated {new Date(project.updated_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ProjectsList;

