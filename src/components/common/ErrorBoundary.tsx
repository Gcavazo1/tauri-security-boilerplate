import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  FallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in its child component tree.
 * It logs error information and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary(): void {
    this.setState({
      hasError: false,
      error: null
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.FallbackComponent) {
        return <this.props.FallbackComponent 
          error={this.state.error as Error} 
          resetErrorBoundary={this.resetErrorBoundary} 
        />;
      }
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}

/**
 * Default fallback component that is rendered when an error occurs
 */
export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg dark:bg-gray-800 mt-10">
      <div className="text-red-500 text-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-2">
        Something went wrong
      </h2>
      <div className="mb-4 p-3 bg-red-50 dark:bg-gray-700 rounded border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm overflow-auto">
        {error.message || 'An unknown error occurred.'}
      </div>
      <div className="text-center">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary; 