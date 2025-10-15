"use client";

import React from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import TasksOverview from "@/components/dashboard/TasksOverview";

function ProjectTasksPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string, 10);

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
      <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white p-6">
        <TasksOverview projectId={projectId} />
      </div>
    </ProtectedRoute>
  );
}

export default ProjectTasksPage;
