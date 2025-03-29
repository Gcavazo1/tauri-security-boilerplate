/**
 * Security helper functions for capability-based access control and data validation
 */

import { securityLogger, SecurityCategory } from './securityLogger';

/**
 * Capability type that defines a specific permission or ability
 */
export type Capability = 'read' | 'write' | 'delete' | 'create' | 'list' | 'admin';

/**
 * Higher-order function that adds capability checks to a function
 * @param capabilities The capabilities required to execute the function
 * @param fn The function to wrap with capability checks
 * @returns A new function that checks capabilities before executing
 */
export function withCapabilities<T extends any[], R>(
  capabilities: Capability[],
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    // Here we would check if the current user has the required capabilities
    // For now, we just log the check and allow the operation
    securityLogger.info(
      SecurityCategory.AUTHORIZATION,
      `Checking capabilities: ${capabilities.join(', ')}`,
      'withCapabilities'
    );
    
    // In a real application, we would check against user permissions
    // If the check passes, we execute the wrapped function
    return fn(...args);
  };
}

/**
 * User data validation schema
 */
export interface UserDataValidationSchema {
  id?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
  username?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
  email?: {
    required: boolean;
    pattern?: RegExp;
  };
  // Add more field validations as needed
}

/**
 * Creates a validator function for user data
 * @param schema The validation schema
 * @returns A validator function
 */
export function createUserDataValidator(schema: UserDataValidationSchema) {
  return (data: Record<string, any>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check each field in the schema
    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];
      
      // Check if required field is present
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        return;
      }
      
      // Skip further checks if the field is not present
      if (value === undefined || value === null) {
        return;
      }
      
      // Check min length
      if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      // Check max length
      if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
      
      // Check pattern
      if (rules.pattern !== undefined && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`${field} has an invalid format`);
      }
    });
    
    // Log validation result
    if (errors.length > 0) {
      securityLogger.warn(
        SecurityCategory.VALIDATION,
        `Data validation failed: ${errors.join(', ')}`,
        'validateUserData'
      );
    } else {
      securityLogger.info(
        SecurityCategory.VALIDATION,
        'Data validation successful',
        'validateUserData'
      );
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };
} 