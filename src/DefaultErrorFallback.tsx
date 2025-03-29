import React from 'react';
import { ErrorFallbackProps } from './components/ErrorBoundary';

/**
 * Default error fallback component
 * This is used by ErrorBoundary when no custom fallback is provided
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="error-boundary-fallback">
      <h2>Something went wrong</h2>
      <div className="error-message">
        <p>{error.message}</p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="reset-button"
      >
        Try again
      </button>
    </div>
  );
};

export default DefaultErrorFallback; 