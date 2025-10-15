'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Users } from 'lucide-react';
import type { Project as BackendProject } from '@/lib/projects/types';
import { adaptBackendProjectToUI, getProjectStateColor } from '@/lib/projects/utils';
import type { Project } from './types';
import ProjectModal from './ProjectModal';
import { useTasks } from '@/lib/hooks/use-tasks';

interface ProjectsGridProps {
  projects: BackendProject[];
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects: backendProjects }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectStats, setProjectStats] = useState<Record<number, { total: number; completed: number }>>({});
  
  // Fetch all tasks to calculate project statistics
  const { tasks } = useTasks({ page: 1, limit: 100 });

  // Calculate task statistics for each project
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const stats: Record<number, { total: number; completed: number }> = {};
      
      tasks.forEach(task => {
        const projectId = task.proyect_id;
        if (!stats[projectId]) {
          stats[projectId] = { total: 0, completed: 0 };
        }
        stats[projectId].total += 1;
        if (task.state === 'Done') {
          stats[projectId].completed += 1;
        }
      });
      
      setProjectStats(stats);
    }
  }, [tasks]);

  // Adapt backend projects to UI format with real task statistics
  useEffect(() => {
    const adapted = backendProjects.map(p => {
      const stats = projectStats[p.proyect_id] || { total: 0, completed: 0 };
      return adaptBackendProjectToUI(p, stats);
    });
    setProjects(adapted);
  }, [backendProjects, projectStats]);

  const handleCreateProject = async () => {
    // The modal will handle creation through the hook
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[#0c272d]/60 mb-4">No projects found</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#14a67e] text-white px-4 py-2 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first project</span>
            </button>
          </div>
        )}
        {projects.map((project) => (
          <div key={project.id} className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0c272d] truncate">{project.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getProjectStateColor(backendProjects.find(p => p.proyect_id === project.id)?.state)}`}>
                {project.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-[#0c272d]/60">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-[#9fdbc2]/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm text-[#0c272d]/60">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{project.team} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{project.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsGrid;

