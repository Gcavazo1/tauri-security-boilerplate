import React from 'react';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function DefaultErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div role="alert" className="p-4 border border-red-300 bg-red-50 rounded-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
      
      {error && (
        <pre className="text-sm text-red-700 overflow-auto p-2 bg-red-100 rounded mb-3">
          {error.message}
        </pre>
      )}
      
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
} 