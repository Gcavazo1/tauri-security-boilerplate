/**
 * Security utility functions
 * 
 * This module provides utility functions for working with data safely
 * in a security context.
 */

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
 * Type for validation functions that verify data
 */
export type Validator<T> = (data: unknown) => data is T;

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