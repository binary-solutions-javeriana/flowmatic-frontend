"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Dashboard } from "@/components/dashboard";
import { DarkModeProvider } from "@/lib/dark-mode-context";

function DashboardContent() {
  return <Dashboard />;
}

export default function DashboardPage() {
  return (
    <DarkModeProvider>
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </DarkModeProvider>
  );
}
