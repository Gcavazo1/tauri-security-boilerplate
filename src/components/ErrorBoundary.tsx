import React, { Component, ErrorInfo, ReactNode } from 'react';
import { securityLogger, SecurityCategory } from '../utils/security/securityLogger';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in children components
 * and display a fallback UI instead of crashing the whole app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    securityLogger.error(
      SecurityCategory.GENERAL,
      `Error caught in ErrorBoundary: ${error.message}`,
      'ErrorBoundary.componentDidCatch',
      { error, errorInfo }
    );
    
    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (React.isValidElement(this.props.fallback)) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-boundary p-4 border border-red-300 bg-red-50 rounded">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="mb-4 text-red-600">{this.state.error?.message}</p>
          <button
            onClick={this.resetErrorBoundary}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
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