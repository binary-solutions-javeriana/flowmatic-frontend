"use client";

import React from "react";
import { checkHealth, API_CONFIG } from "@/lib/api";

export default function ApiTest() {
  const [health, setHealth] = React.useState<{
    status: string;
    service: string;
    uptime: number;
    timestamp: string;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const testHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkHealth();
      setHealth(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">API Health Check</h3>
      <p className="text-sm text-gray-600 mb-3">
        Testing connection to: <code>{API_CONFIG.healthUrl}</code>
      </p>
      
      <button
        onClick={testHealth}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test API Connection"}
      </button>

      {health && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <h4 className="font-medium text-green-800">✅ API is healthy</h4>
          <pre className="text-sm text-green-700 mt-2">
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <h4 className="font-medium text-red-800">❌ API connection failed</h4>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
