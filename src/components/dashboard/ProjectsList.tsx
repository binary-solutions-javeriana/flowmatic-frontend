'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Calendar, X, Filter, CheckSquare } from 'lucide-react';
import { useProjects } from '@/lib/hooks/use-projects';
import type { ProjectFilters, Project } from '@/lib/types/project-types';
import ProjectModal from './ProjectModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import { getProjectStateColor } from '@/lib/projects/utils';
import { formatDateSafe } from './utils';

interface ProjectsListProps {
  onViewTasks?: (projectId: number) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ onViewTasks }) => {
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12,
    category: 'owned'  // Default category
  });
  
  const { projects, pagination, loading, error, fetchProjects } = useProjects(filters);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[ProjectsList] Component state:', {
      projectsCount: projects?.length || 0,
      projects,
      pagination,
      loading,
      error,
      filters
    });
  }, [projects, pagination, loading, error, filters]);

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

  const handleViewTasks = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewTasks) {
      onViewTasks(projectId);
    }
  };

  const handleCategoryChange = (category: 'owned' | 'participant' | 'tenant') => {
    const newFilters = { ...filters, category, page: 1 };
    setFilters(newFilters);
    fetchProjects(newFilters);
  };

  return (
    <div className="p-4">
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />

      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        project={selectedProject}
        onUpdate={handleProjectUpdate}
        onViewTasks={onViewTasks}
      />

      {/* Category Selection */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-4 border border-[#9fdbc2]/20 dark:border-gray-700/20 shadow-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('owned')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              filters.category === 'owned'
                ? 'bg-[#14a67e] text-white shadow-lg'
                : 'bg-white/50 dark:bg-gray-700/50 text-[#0c272d] dark:text-white hover:bg-white/70 dark:hover:bg-gray-600/70'
            }`}
          >
            Mis Proyectos
          </button>
          <button
            onClick={() => handleCategoryChange('participant')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              filters.category === 'participant'
                ? 'bg-[#14a67e] text-white shadow-lg'
                : 'bg-white/50 dark:bg-gray-700/50 text-[#0c272d] dark:text-white hover:bg-white/70 dark:hover:bg-gray-600/70'
            }`}
          >
            Asignados a Mí
          </button>
          <button
            onClick={() => handleCategoryChange('tenant')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              filters.category === 'tenant'
                ? 'bg-[#14a67e] text-white shadow-lg'
                : 'bg-white/50 dark:bg-gray-700/50 text-[#0c272d] dark:text-white hover:bg-white/70 dark:hover:bg-gray-600/70'
            }`}
          >
            Todos del Tenant
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proyectos..."
                className="w-full px-4 py-2 rounded-2xl bg-white/50 dark:bg-gray-700/50 text-[#0c272d] dark:text-white placeholder:text-[#0c272d]/50 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#14a67e] focus:ring-opacity-50 transition-all duration-300"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  onClick={handleClearSearch}
                  className="p-2 rounded-full hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-300"
                >
                  <X className="w-5 h-5 text-[#0c272d] dark:text-white" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#14a67e] text-white font-semibold shadow-md hover:bg-[#129e6b] transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Proyecto
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-2xl bg-white/50 dark:bg-gray-700/50 text-[#0c272d] dark:text-white flex items-center gap-2 hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-300">
              <Calendar className="w-5 h-5" />
              Filtrar por Fecha
            </button>
            <button className="px-4 py-2 rounded-2xl bg-white/50 dark:bg-gray-700/50 text-[#0c272d] dark:text-white flex items-center gap-2 hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-300">
              <Filter className="w-5 h-5" />
              Filtrar por Estado
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="mt-6">
        {loading && <p className="text-center text-gray-500">Cargando proyectos...</p>}
        {error && <p className="text-center text-red-500">Error al cargar proyectos</p>}
        {projects.length === 0 && !loading && (
          <p className="text-center text-gray-500">No se encontraron proyectos</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.proyect_id}
              onClick={() => handleProjectClick(project)}
              className="p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0c272d]">{project.name_proyect}</h3>
                  <p className="text-sm text-gray-500">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getProjectStateColor(project.state)}`}
                    />
                    <span className="text-xs font-medium uppercase tracking-wide text-[#0c272d]">
                      {project.state}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateSafe(project.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
                pagination.page <= 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#14a67e] text-white shadow-md hover:bg-[#129e6b] flex items-center gap-2'
              }`}
            >
              <X className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-sm text-[#0c272d]">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
                pagination.page >= pagination.totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#14a67e] text-white shadow-md hover:bg-[#129e6b] flex items-center gap-2'
              }`}
            >
              Siguiente
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
