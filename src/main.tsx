import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary, { ErrorFallbackProps } from "./components/common/ErrorBoundary";

// Custom error handler for critical root-level errors
const handleRootError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error("Root level error:", error);
  console.error("Component stack:", errorInfo.componentStack);
};

// Define a proper error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="error-container">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Define a fallback UI for critical failures
const rootFallback = (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
      <div className="flex items-center justify-center mb-4 text-red-500">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
        Application Error
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
        Something went wrong. Please try refreshing the application.
      </p>
      <div className="flex justify-center">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Application
        </button>
      </div>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={handleRootError}
      FallbackComponent={ErrorFallback}
      fallback={rootFallback}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
); 