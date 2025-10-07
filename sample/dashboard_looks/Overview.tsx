'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, FolderOpen, Target, TrendingUp } from 'lucide-react';
import type { Project as BackendProject } from '@/lib/projects/types';
import { adaptBackendProjectToUI } from '@/lib/projects/utils';
import type { Project } from './types';
import { getStatusColor } from './utils';

interface OverviewProps {
  projects: BackendProject[];
}

const Overview: React.FC<OverviewProps> = ({ projects: backendProjects }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  // Adapt backend projects to UI format
  useEffect(() => {
    // For now, convert without stats. In a full implementation, 
    // you would fetch stats for each project
    const adapted = backendProjects.slice(0, 5).map(p => adaptBackendProjectToUI(p));
    setProjects(adapted);
  }, [backendProjects]);

  const totalProjects = backendProjects.length;
  const completedProjects = backendProjects.filter(p => p.state === 'Completed').length;
  const inProgressProjects = backendProjects.filter(p => p.state === 'In Progress').length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0c272d]/60">Total Projects</p>
              <p className="text-3xl font-bold text-[#0c272d]">{totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-[#14a67e]/10 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-[#14a67e]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{completedProjects} completed</span>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0c272d]/60">In Progress</p>
              <p className="text-3xl font-bold text-[#0c272d]">{inProgressProjects}</p>
            </div>
            <div className="w-12 h-12 bg-[#14a67e]/10 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#14a67e]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-600">Active projects</span>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0c272d]/60">Planning</p>
              <p className="text-3xl font-bold text-[#0c272d]">{backendProjects.filter(p => p.state === 'Planning').length}</p>
            </div>
            <div className="w-12 h-12 bg-[#14a67e]/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-[#14a67e]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Target className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600">In planning phase</span>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0c272d]/60">Success Rate</p>
              <p className="text-3xl font-bold text-[#0c272d]">
                {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-[#14a67e]/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#14a67e]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">Completion rate</span>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#0c272d]">Recent Projects</h2>
          <button className="text-[#14a67e] hover:text-[#14a67e]/80 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 bg-white/40 rounded-xl border border-[#9fdbc2]/10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#14a67e]/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-[#14a67e]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#0c272d]">{project.name}</h3>
                  <p className="text-sm text-[#0c272d]/60">{project.tasks.completed}/{project.tasks.total} tasks completed</p>
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
                  <p className="text-sm text-[#0c272d]/60 mt-1">{project.progress}% complete</p>
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

