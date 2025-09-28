"use client";

import React from 'react';
import { UserFriendlyError, getErrorSeverityColor, getErrorIcon } from '@/lib/error-mapping';

interface ErrorDisplayProps {
  error: UserFriendlyError;
  onDismiss?: () => void;
  showSuggestions?: boolean;
  className?: string;
}

export default function ErrorDisplay({ 
  error, 
  onDismiss, 
  showSuggestions = true,
  className = '' 
}: ErrorDisplayProps) {
  const severityColors = getErrorSeverityColor(error.severity);
  const icon = getErrorIcon(error.severity);

  return (
    <div className={`rounded-lg border p-4 ${severityColors} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg" aria-hidden="true">
            {icon}
          </span>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {error.title}
          </h3>
          
          <div className="mt-1">
            <p className="text-sm">
              {error.message}
            </p>
          </div>

          {showSuggestions && error.suggestions && error.suggestions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium opacity-75 mb-1">
                What you can do:
              </h4>
              <ul className="text-xs space-y-1">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error.retryable && (
            <div className="mt-3">
              <button
                onClick={() => window.location.reload()}
                className="text-xs underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current"
              aria-label="Dismiss error"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact error display for forms
export function CompactErrorDisplay({ error }: { error: UserFriendlyError }) {
  const severityColors = getErrorSeverityColor(error.severity);
  const icon = getErrorIcon(error.severity);

  return (
    <div className={`rounded-md border p-2 ${severityColors}`}>
      <div className="flex items-center">
        <span className="text-sm mr-2" aria-hidden="true">
          {icon}
        </span>
        <p className="text-sm font-medium">
          {error.message}
        </p>
      </div>
    </div>
  );
}

// Error boundary component for catching React errors
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-lg font-semibold text-red-900 mb-2">
            Something went wrong
          </h1>
          
          <p className="text-sm text-red-700 mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Refresh Page
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition"
            >
              Go Home
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-red-600 cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
