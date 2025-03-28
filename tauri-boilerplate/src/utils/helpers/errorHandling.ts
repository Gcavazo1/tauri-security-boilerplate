/**
 * Error handling utilities for the application
 */

// Define application error types
export enum ErrorType {
  Network = 'NETWORK',
  Authentication = 'AUTHENTICATION',
  Authorization = 'AUTHORIZATION',
  Validation = 'VALIDATION',
  NotFound = 'NOT_FOUND',
  Server = 'SERVER',
  Client = 'CLIENT',
  Unknown = 'UNKNOWN'
}

// Main application error class
export class AppError extends Error {
  type: ErrorType;
  timestamp: Date;
  context?: Record<string, unknown>;
  originalError?: unknown;

  constructor(
    message: string,
    type: ErrorType = ErrorType.Unknown,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.timestamp = new Date();
    this.context = context;
    this.originalError = originalError;

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Creates a user-friendly error message
   */
  getFriendlyMessage(): string {
    switch (this.type) {
      case ErrorType.Network:
        return 'Network error. Please check your connection and try again.';
      case ErrorType.Authentication:
        return 'Authentication required. Please sign in again.';
      case ErrorType.Authorization:
        return 'You don\'t have permission to perform this action.';
      case ErrorType.Validation:
        return 'Please check your input and try again.';
      case ErrorType.NotFound:
        return 'The requested resource was not found.';
      case ErrorType.Server:
        return 'Server error. Please try again later.';
      case ErrorType.Client:
        return 'Application error. Please restart the application.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Logs the error to console (and potentially to a logging service in production)
   */
  log(): void {
    console.error(`[${this.type}] ${this.message}`, {
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      originalError: this.originalError
    });
  }
}

/**
 * Error boundary fallback props interface
 */
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Helper function to wrap async functions with consistent error handling
 * @param fn The async function to wrap
 * @param errorType The default error type to assign if an error occurs
 * @returns A wrapped function with consistent error handling
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorType: ErrorType = ErrorType.Unknown
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      // If it's already an AppError, just rethrow it
      if (error instanceof AppError) {
        throw error;
      }

      // Otherwise, wrap it in an AppError
      const appError = new AppError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        errorType,
        { arguments: args },
        error
      );
      
      appError.log();
      throw appError;
    }
  };
}

/**
 * Format error for display in UI
 * @param error The error to format
 * @returns A user-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.getFriendlyMessage();
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
} 