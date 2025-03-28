/**
 * Safe IPC utility for Tauri applications
 * 
 * This utility wraps Tauri's invoke function to provide:
 * 1. Type safety with TypeScript
 * 2. Input validation before sending data to backend
 * 3. Result validation after receiving data from backend
 * 4. Error handling and logging
 */

import { invoke } from '@tauri-apps/api/core';
import { securityLogger, SecurityCategory } from './securityLogger';
import { isCleanInput } from '../helpers/validation';

/**
 * Type for validation functions that verify data
 */
type Validator<T> = (data: unknown) => data is T;

/**
 * Type for transformers that can modify data before/after transmission
 */
type Transformer<In, Out> = (data: In) => Out;

/**
 * Options for configuring safe IPC calls
 */
interface SafeIpcOptions<P, R> {
  // Command name to invoke on the Rust backend
  command: string;
  
  // Optional validator for parameters
  validateParams?: Validator<P>;
  
  // Optional validator for result
  validateResult?: Validator<R>;
  
  // Optional transformer for parameters before sending
  transformParams?: Transformer<P, unknown>;
  
  // Optional transformer for result after receiving
  transformResult?: Transformer<unknown, R>;
  
  // Whether to automatically sanitize string parameters
  sanitizeStringParams?: boolean;
  
  // Whether to log parameters (might contain sensitive data)
  logParams?: boolean;
  
  // Whether to log result (might contain sensitive data)
  logResult?: boolean;
}

/**
 * Error thrown when IPC communication fails
 */
export class SafeIpcError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
    public readonly command?: string,
    public readonly params?: unknown
  ) {
    super(message);
    this.name = 'SafeIpcError';
  }
}

/**
 * Create a type-safe, validated IPC function
 * @param options Configuration options for the IPC call
 * @returns A safely wrapped function for invoking Rust commands
 */
export function createSafeIpc<P, R>(
  options: SafeIpcOptions<P, R>
): (params: P) => Promise<R> {
  return async (params: P): Promise<R> => {
    try {
      // Validate parameters if validator provided
      if (options.validateParams && !options.validateParams(params)) {
        const error = new SafeIpcError(
          `Invalid parameters for command ${options.command}`,
          null,
          options.command,
          params
        );
        
        securityLogger.error(
          SecurityCategory.INPUT_VALIDATION,
          `Invalid parameters for IPC command ${options.command}`,
          'safeIpc',
          { params }
        );
        
        throw error;
      }
      
      // Sanitize string parameters if enabled
      let processedParams: unknown = params;
      if (options.sanitizeStringParams) {
        processedParams = sanitizeParams(params);
      }
      
      // Transform parameters if transformer provided
      if (options.transformParams) {
        processedParams = options.transformParams(params);
      }
      
      // Log parameters if enabled (be cautious with sensitive data)
      if (options.logParams) {
        securityLogger.info(
          SecurityCategory.DATA_ACCESS,
          `Executing IPC command ${options.command}`,
          'safeIpc',
          { params: processedParams }
        );
      } else {
        securityLogger.info(
          SecurityCategory.DATA_ACCESS,
          `Executing IPC command ${options.command}`,
          'safeIpc'
        );
      }
      
      // Invoke the command
      const result = await invoke<unknown>(options.command, processedParams as Record<string, unknown>);
      
      // Transform result if transformer provided
      let processedResult: R;
      if (options.transformResult) {
        processedResult = options.transformResult(result);
      } else {
        processedResult = result as R;
      }
      
      // Validate result if validator provided
      if (options.validateResult && !options.validateResult(processedResult)) {
        const error = new SafeIpcError(
          `Invalid result from command ${options.command}`,
          null,
          options.command,
          params
        );
        
        securityLogger.error(
          SecurityCategory.DATA_ACCESS,
          `Invalid result from IPC command ${options.command}`,
          'safeIpc',
          { result }
        );
        
        throw error;
      }
      
      // Log result if enabled (be cautious with sensitive data)
      if (options.logResult) {
        securityLogger.info(
          SecurityCategory.DATA_ACCESS,
          `Received result from IPC command ${options.command}`,
          'safeIpc',
          { result: processedResult }
        );
      }
      
      return processedResult;
    } catch (error) {
      // Handle and log errors
      if (error instanceof SafeIpcError) {
        throw error;
      }
      
      const safeError = new SafeIpcError(
        `Error invoking command ${options.command}: ${(error as Error)?.message || 'Unknown error'}`,
        error,
        options.command,
        params
      );
      
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        `Error in IPC command ${options.command}: ${(error as Error)?.message || 'Unknown error'}`,
        'safeIpc',
        { error, params }
      );
      
      throw safeError;
    }
  };
}

/**
 * Sanitize parameters before sending to backend
 * @param params Parameters to sanitize
 * @returns Sanitized parameters
 */
function sanitizeParams<T>(params: T): T {
  if (params === null || params === undefined) {
    return params;
  }
  
  if (typeof params === 'string') {
    // Sanitize strings
    if (!isCleanInput(params)) {
      securityLogger.warning(
        SecurityCategory.INPUT_VALIDATION,
        'Potentially unsafe input sanitized',
        'safeIpc',
        { input: params }
      );
    }
    return params.trim() as unknown as T;
  }
  
  if (typeof params === 'object') {
    // Handle arrays
    if (Array.isArray(params)) {
      return params.map(item => sanitizeParams(item)) as unknown as T;
    }
    
    // Handle objects
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      sanitized[key] = sanitizeParams(value);
    }
    return sanitized as unknown as T;
  }
  
  // Return as is for other types
  return params;
}

/**
 * Validator function for checking if a value is a primitive type
 */
export function isPrimitive(value: unknown): value is string | number | boolean | null | undefined {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/**
 * Validator function for checking if a value is a JSON object
 */
export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Create a simple validator for an object type with expected properties
 * @param expectedProps Array of expected property names
 * @returns A validator function for the object
 */
export function createObjectValidator<T>(expectedProps: string[]): Validator<T> {
  return (data: unknown): data is T => {
    if (!isJsonObject(data)) {
      return false;
    }
    
    for (const prop of expectedProps) {
      if (!(prop in data)) {
        return false;
      }
    }
    
    return true;
  };
}

/**
 * Create a validator for checking if a value matches a specific schema
 * @param schema Zod schema or similar validation schema
 * @returns A validator function for the schema
 */
export function createSchemaValidator<T>(schema: { safeParse: (data: unknown) => { success: boolean } }): Validator<T> {
  return (data: unknown): data is T => {
    try {
      return schema.safeParse(data).success;
    } catch (error) {
      return false;
    }
  };
}

/**
 * Create a validator for array types
 * @param itemValidator Validator for individual array items
 * @returns A validator function for arrays
 */
export function createArrayValidator<T>(itemValidator: Validator<T>): Validator<T[]> {
  return (data: unknown): data is T[] => {
    if (!Array.isArray(data)) {
      return false;
    }
    
    return data.every(item => itemValidator(item));
  };
}

/**
 * Example usage:
 * 
 * // Define the parameter and result types
 * interface ReadFileParams {
 *   path: string;
 *   options?: { encoding?: string; };
 * }
 * 
 * // Create validators
 * const validateReadFileParams = createObjectValidator<ReadFileParams>(['path']);
 * 
 * // Create a safe IPC function
 * const readFile = createSafeIpc<ReadFileParams, string>({
 *   command: 'read_file',
 *   validateParams: validateReadFileParams,
 *   sanitizeStringParams: true
 * });
 * 
 * // Use the safe IPC function
 * async function loadConfig() {
 *   try {
 *     const content = await readFile({ path: 'config.json' });
 *     return JSON.parse(content);
 *   } catch (error) {
 *     console.error('Failed to read file:', error);
 *     return null;
 *   }
 * }
 */ 