import React, { Component, ErrorInfo, ReactNode } from 'react';
import { securityLogger, SecurityCategory } from '../utils/security/securityLogger';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: React.ComponentType<ErrorFallbackProps> | React.ReactElement;
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
    // Log the error to the security logger
    securityLogger.error(
      SecurityCategory.APPLICATION,
      `React error boundary caught an error: ${error.message}`,
      'ErrorBoundary.componentDidCatch',
      { error, errorInfo }
    );
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // If fallback is a component (function or class)
      if (React.isValidElement(fallback)) {
        return fallback;
      }
      
      // If fallback is a component type (React.ComponentType)
      const FallbackComponent = fallback as React.ComponentType<ErrorFallbackProps>;
      return (
        <FallbackComponent
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return children;
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