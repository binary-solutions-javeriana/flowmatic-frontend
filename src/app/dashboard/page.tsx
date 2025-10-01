"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Dashboard } from "@/components/dashboard";

function DashboardContent() {
  return <Dashboard />;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
