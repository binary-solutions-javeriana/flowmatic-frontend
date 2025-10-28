'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, FolderOpen, Target, TrendingUp } from 'lucide-react';
import type { Project as BackendProject } from '@/lib/projects/types';
import { adaptBackendProjectToUI } from '@/lib/projects/utils';
import type { Project } from './types';
import { getStatusColor } from './utils';
import { useTasks } from '@/lib/hooks/use-tasks';

interface OverviewProps {
  projects: BackendProject[];
}

const Overview: React.FC<OverviewProps> = ({ projects: backendProjects }) => {
  const [projects, setProjects] = useState<Project[]>([]);
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
    const adapted = backendProjects.slice(0, 5).map(p => {
      const stats = projectStats[p.proyect_id] || { total: 0, completed: 0 };
      return adaptBackendProjectToUI(p, stats);
    });
    setProjects(adapted);
  }, [backendProjects, projectStats]);

  // Calculate real project statistics
  const totalProjects = backendProjects.length;
  const completedProjects = backendProjects.filter(p => p.state === 'Completed').length;
  const inProgressProjects = backendProjects.filter(p => p.state === 'In Progress').length;
  const planningProjects = backendProjects.filter(p => p.state === 'Planning').length;
  const onHoldProjects = backendProjects.filter(p => p.state === 'On Hold').length;
  
  // Calculate overall task statistics
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(task => task.state === 'Done').length || 0;
  const inProgressTasks = tasks?.filter(task => task.state === 'In Progress').length || 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 dark:border-gray-700/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0c272d]/60 dark:text-gray-300/60">Total Projects</p>
              <p className="text-3xl font-bold text-[#0c272d] dark:text-white">{totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-[#14a67e]/10 dark:bg-[#14a67e]/20 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-[#14a67e]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{completedProjects} completed</span>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 dark:border-gray-700/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0c272d]/60 dark:text-gray-300/60">In Progress</p>
              <p className="text-3xl font-bold text-[#0c272d] dark:text-white">{inProgressProjects}</p>
            </div>
            <div className="w-12 h-12 bg-[#14a67e]/10 dark:bg-[#14a67e]/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#14a67e]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-600">Active projects</span>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 dark:border-gray-700/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0c272d]/60 dark:text-gray-300/60">Planning</p>
              <p className="text-3xl font-bold text-[#0c272d] dark:text-white">{planningProjects}</p>
            </div>
            <div className="w-12 h-12 bg-[#14a67e]/10 dark:bg-[#14a67e]/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-[#14a67e]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Target className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600">In planning phase</span>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 dark:border-gray-700/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0c272d]/60 dark:text-gray-300/60">Task Completion</p>
              <p className="text-3xl font-bold text-[#0c272d] dark:text-white">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-[#14a67e]/10 dark:bg-[#14a67e]/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#14a67e]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{completedTasks}/{totalTasks} tasks done</span>
          </div>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 dark:border-gray-700/20 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#0c272d] dark:text-white">Recent Projects</h2>
          <button className="text-[#14a67e] hover:text-[#14a67e]/80 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={project.id || `project-${index}`} className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl border border-[#9fdbc2]/10 dark:border-gray-600/10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#14a67e]/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-[#14a67e]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#0c272d] dark:text-white">{project.name}</h3>
                  <p className="text-sm text-[#0c272d]/60 dark:text-gray-300/60">
                    {project.tasks.total === 0 
                      ? 'No tasks assigned yet' 
                      : `${project.tasks.completed}/${project.tasks.total} tasks completed`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="w-32 bg-[#9fdbc2]/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-[#0c272d]/60 dark:text-gray-300/60 mt-1">{project.progress}% complete</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;

