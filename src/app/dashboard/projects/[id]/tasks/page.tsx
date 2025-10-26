"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import TasksOverview from "@/components/dashboard/TasksOverview";
import type { SidebarItem } from "@/components/dashboard/types";
import {
  FolderOpen,
  Home,
  Settings as SettingsIcon,
} from "lucide-react";

function ProjectTasksPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string, 10);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems: SidebarItem[] = useMemo(
    () => [
      { id: 'overview', icon: Home, label: 'Overview', active: false },
      { id: 'projects', icon: FolderOpen, label: 'Projects', active: false },
      { id: 'settings', icon: SettingsIcon, label: 'Settings', active: false },
    ],
    []
  );

  const handleSidebarSelect = (view: string) => {
    // Navigate based on selection
    if (view === 'overview') {
      window.location.href = '/dashboard';
    } else if (view === 'projects') {
      window.location.href = '/dashboard';
    } else if (view === 'settings') {
      window.location.href = '/dashboard';
    }
  };

  if (isNaN(projectId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9fdbc2]/5 to-white">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Invalid Project ID</div>
          <p className="text-[#0c272d]/60">The project ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white flex">
        <Sidebar
          isOpen={sidebarOpen}
          items={sidebarItems}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          onSelect={handleSidebarSelect}
        />

        <div className="flex-1 flex flex-col">
          <Header title="Project Tasks" onNavigate={handleSidebarSelect} />
          <main className="flex-1 p-6 overflow-auto">
            <TasksOverview projectId={projectId} />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default ProjectTasksPage;
