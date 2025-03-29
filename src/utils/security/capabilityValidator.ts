/**
 * Capability-based validation module
 * 
 * This module provides security capabilities validation for operations
 * based on the principle of least privilege and secure access control.
 */

import { securityLogger, SecurityCategory } from './securityLogger';

/**
 * Enum for various capabilities in the application
 */
export enum Capability {
  READ_FILES = 'read_files',
  WRITE_FILES = 'write_files',
  DELETE_FILES = 'delete_files',
  READ_USER_DATA = 'read_user_data',
  WRITE_USER_DATA = 'write_user_data',
  EXECUTE_SCRIPTS = 'execute_scripts',
  NETWORK_ACCESS = 'network_access'
}

/**
 * Interface for validated operation result
 */
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Checks if the current action has the required capability
 * @param requiredCapability The capability required for the operation
 * @param context Additional context for logging
 * @returns Whether the operation is allowed
 */
export function hasCapability(
  requiredCapability: Capability,
  context: Record<string, unknown> = {}
): boolean {
  // Log the capability check
  securityLogger.info(
    SecurityCategory.AUTHORIZATION,
    `Capability check for: ${requiredCapability}`,
    'hasCapability',
    context
  );
  
  // In a real implementation, this would check against user permissions,
  // possibly from a secure store or authentication token
  
  // For this template, we'll allow all operations but log them for audit
  return true;
}

/**
 * Higher-order function to wrap an operation with capability validation
 * @param capability The capability required for the operation
 * @param operation The operation function to execute if allowed
 * @returns A wrapped function that checks capabilities before executing
 */
export function withCapability<T, A extends any[]>(
  capability: Capability,
  operation: (...args: A) => Promise<T>
): (...args: A) => Promise<OperationResult<T>> {
  return async (...args: A): Promise<OperationResult<T>> => {
    try {
      // Check if the operation is allowed
      if (!hasCapability(capability, { args })) {
        securityLogger.warn(
          SecurityCategory.AUTHORIZATION,
          `Operation denied due to missing capability: ${capability}`,
          'withCapability',
          { args }
        );
        
        return {
          success: false,
          error: `Operation not permitted: missing capability ${capability}`
        };
      }
      
      // If allowed, execute the operation
      const result = await operation(...args);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      securityLogger.error(
        SecurityCategory.AUTHORIZATION,
        `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
        'withCapability',
        { capability, args, error }
      );
      
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  };
}

/**
 * Example usage:
 * 
 * const readFile = withCapabilities(
 *   [{ name: 'fs:read', description: 'Read from filesystem', severity: 'high' }],
 *   (path: string) => {
 *     // Implementation here
 *     return fs.readFileSync(path, 'utf8');
 *   }
 * );
 * 
 * // Usage
 * try {
 *   const content = readFile('/path/to/file.txt');
 * } catch (error) {
 *   console.error('Access denied');
 * }
 */ 