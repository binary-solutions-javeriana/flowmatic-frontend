"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

function ProjectsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard - projects view will be accessible from sidebar
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9fdbc2]/5 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e] mx-auto"></div>
        <p className="mt-4 text-[#0c272d]/60">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsRedirect />
    </ProtectedRoute>
  );
}

