/**
 * Type conversion utilities for Rust-TypeScript interoperability
 * 
 * This file handles the conversion between Rust's snake_case and TypeScript's camelCase types
 */

// Raw types from Rust backend (snake_case)
export interface RustFileInfo {
  id: string;
  name: string;
  path: string;
  is_directory: boolean;
  size: number;
  last_modified: number;
  file_type: string;
}

// Frontend-friendly types (camelCase)
export interface FileInfo {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  lastModified: number;
  fileType: string;
}

/**
 * Converts a Rust FileInfo object to client-side FileInfo
 * @param rustInfo The Rust-generated file information
 * @returns A TypeScript-friendly version with camelCase properties
 */
export function convertToClientFileInfo(rustInfo: RustFileInfo): FileInfo {
  return {
    id: rustInfo.id,
    name: rustInfo.name,
    path: rustInfo.path,
    isDirectory: rustInfo.is_directory,
    size: rustInfo.size,
    lastModified: rustInfo.last_modified,
    fileType: rustInfo.file_type
  };
}

/**
 * Converts an array of Rust FileInfo objects to client-side FileInfo objects
 * @param rustInfoArray Array of Rust-generated file information
 * @returns Array of TypeScript-friendly objects with camelCase properties
 */
export function convertToClientFileInfoArray(rustInfoArray: RustFileInfo[]): FileInfo[] {
  return rustInfoArray.map(convertToClientFileInfo);
}

/**
 * Generic function to convert any snake_case object to camelCase
 * @param obj Object with snake_case keys
 * @returns Same object with camelCase keys
 */
export function snakeToCamel<T extends Record<string, any>, U extends Record<string, any>>(obj: T): U {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  });
  
  return result as U;
}

/**
 * Generic function to convert any camelCase object to snake_case
 * @param obj Object with camelCase keys
 * @returns Same object with snake_case keys
 */
export function camelToSnake<T extends Record<string, any>, U extends Record<string, any>>(obj: T): U {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, (_, letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  });
  
  return result as U;
} 