/**
 * Safe file handling utilities for Tauri applications
 * 
 * These utilities wrap Tauri's filesystem APIs to provide:
 * 1. Input validation and sanitization
 * 2. Proper error handling
 * 3. Security logging
 * 4. Permission checks
 * 5. Path traversal protection
 */

import { readTextFile, writeTextFile, readBinaryFile, writeBinaryFile, readDir, createDir, removeDir, removeFile, renameFile, copyFile } from '@tauri-apps/api/fs';
import { securityLogger, SecurityCategory } from './securityLogger';
import { isValidFilePath, sanitizeFileName } from '../helpers/validation';
import { withCapabilities, CapabilityCategory } from './capabilityValidator';
import { SafeIpcError } from './safeIpc';

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends Error {
  constructor(
    message: string,
    public readonly path?: string,
    public readonly originalError?: unknown,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'FileOperationError';
  }
}

/**
 * Safe implementation of readTextFile with security checks
 */
export const safeReadTextFile = withCapabilities(
  [
    {
      category: CapabilityCategory.FS,
      name: 'readFile',
      description: 'Ability to read files from the filesystem',
      severity: 'high'
    }
  ],
  async (path: string, options?: { encoding?: string }): Promise<string> => {
    try {
      // Validate path
      if (!isValidFilePath(path)) {
        const error = new FileOperationError(
          `Invalid file path: ${path}`,
          path,
          null,
          'readTextFile'
        );
        
        securityLogger.error(
          SecurityCategory.FILESYSTEM,
          `Attempted to read from invalid path: ${path}`,
          'safeFileHandling',
          { path }
        );
        
        throw error;
      }
      
      // Log the operation
      securityLogger.info(
        SecurityCategory.FILESYSTEM,
        `Reading text file: ${path}`,
        'safeFileHandling',
        { path }
      );
      
      // Perform the operation
      const content = await readTextFile(path, options);
      
      return content;
    } catch (error) {
      // Handle and log errors
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      const fileError = new FileOperationError(
        `Failed to read text file: ${(error as Error)?.message || 'Unknown error'}`,
        path,
        error,
        'readTextFile'
      );
      
      securityLogger.error(
        SecurityCategory.FILESYSTEM,
        `Failed to read text file: ${path}`,
        'safeFileHandling',
        { error, path }
      );
      
      throw fileError;
    }
  }
);

/**
 * Safe implementation of writeTextFile with security checks
 */
export const safeWriteTextFile = withCapabilities(
  [
    {
      category: CapabilityCategory.FS,
      name: 'writeFile',
      description: 'Ability to write files to the filesystem',
      severity: 'high'
    }
  ],
  async (path: string, contents: string): Promise<void> => {
    try {
      // Validate path
      if (!isValidFilePath(path)) {
        const error = new FileOperationError(
          `Invalid file path: ${path}`,
          path,
          null,
          'writeTextFile'
        );
        
        securityLogger.error(
          SecurityCategory.FILESYSTEM,
          `Attempted to write to invalid path: ${path}`,
          'safeFileHandling',
          { path }
        );
        
        throw error;
      }
      
      // Log the operation
      securityLogger.info(
        SecurityCategory.FILESYSTEM,
        `Writing text file: ${path}`,
        'safeFileHandling',
        { path }
      );
      
      // Perform the operation
      await writeTextFile(path, contents);
    } catch (error) {
      // Handle and log errors
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      const fileError = new FileOperationError(
        `Failed to write text file: ${(error as Error)?.message || 'Unknown error'}`,
        path,
        error,
        'writeTextFile'
      );
      
      securityLogger.error(
        SecurityCategory.FILESYSTEM,
        `Failed to write text file: ${path}`,
        'safeFileHandling',
        { error, path }
      );
      
      throw fileError;
    }
  }
);

/**
 * Safe implementation of readBinaryFile with security checks
 */
export const safeReadBinaryFile = withCapabilities(
  [
    {
      category: CapabilityCategory.FS,
      name: 'readFile',
      description: 'Ability to read files from the filesystem',
      severity: 'high'
    }
  ],
  async (path: string): Promise<Uint8Array> => {
    try {
      // Validate path
      if (!isValidFilePath(path)) {
        const error = new FileOperationError(
          `Invalid file path: ${path}`,
          path,
          null,
          'readBinaryFile'
        );
        
        securityLogger.error(
          SecurityCategory.FILESYSTEM,
          `Attempted to read binary from invalid path: ${path}`,
          'safeFileHandling',
          { path }
        );
        
        throw error;
      }
      
      // Log the operation
      securityLogger.info(
        SecurityCategory.FILESYSTEM,
        `Reading binary file: ${path}`,
        'safeFileHandling',
        { path }
      );
      
      // Perform the operation
      const content = await readBinaryFile(path);
      
      return content;
    } catch (error) {
      // Handle and log errors
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      const fileError = new FileOperationError(
        `Failed to read binary file: ${(error as Error)?.message || 'Unknown error'}`,
        path,
        error,
        'readBinaryFile'
      );
      
      securityLogger.error(
        SecurityCategory.FILESYSTEM,
        `Failed to read binary file: ${path}`,
        'safeFileHandling',
        { error, path }
      );
      
      throw fileError;
    }
  }
);

/**
 * Safe implementation of writeBinaryFile with security checks
 */
export const safeWriteBinaryFile = withCapabilities(
  [
    {
      category: CapabilityCategory.FS,
      name: 'writeFile',
      description: 'Ability to write files to the filesystem',
      severity: 'high'
    }
  ],
  async (path: string, contents: Uint8Array): Promise<void> => {
    try {
      // Validate path
      if (!isValidFilePath(path)) {
        const error = new FileOperationError(
          `Invalid file path: ${path}`,
          path,
          null,
          'writeBinaryFile'
        );
        
        securityLogger.error(
          SecurityCategory.FILESYSTEM,
          `Attempted to write binary to invalid path: ${path}`,
          'safeFileHandling',
          { path }
        );
        
        throw error;
      }
      
      // Log the operation
      securityLogger.info(
        SecurityCategory.FILESYSTEM,
        `Writing binary file: ${path}`,
        'safeFileHandling',
        { path }
      );
      
      // Perform the operation
      await writeBinaryFile(path, contents);
    } catch (error) {
      // Handle and log errors
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      const fileError = new FileOperationError(
        `Failed to write binary file: ${(error as Error)?.message || 'Unknown error'}`,
        path,
        error,
        'writeBinaryFile'
      );
      
      securityLogger.error(
        SecurityCategory.FILESYSTEM,
        `Failed to write binary file: ${path}`,
        'safeFileHandling',
        { error, path }
      );
      
      throw fileError;
    }
  }
);

/**
 * Interface for directory entry with sanitized name
 */
export interface SafeDirectoryEntry {
  name: string;
  path: string;
  children?: SafeDirectoryEntry[];
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
}

/**
 * Safe implementation of readDir with security checks
 */
export const safeReadDir = withCapabilities(
  [
    {
      category: CapabilityCategory.FS,
      name: 'readDir',
      description: 'Ability to read directories from the filesystem',
      severity: 'high'
    }
  ],
  async (path: string, options?: { recursive?: boolean }): Promise<SafeDirectoryEntry[]> => {
    try {
      // Validate path
      if (!isValidFilePath(path)) {
        const error = new FileOperationError(
          `Invalid directory path: ${path}`,
          path,
          null,
          'readDir'
        );
        
        securityLogger.error(
          SecurityCategory.FILESYSTEM,
          `Attempted to read invalid directory: ${path}`,
          'safeFileHandling',
          { path }
        );
        
        throw error;
      }
      
      // Log the operation
      securityLogger.info(
        SecurityCategory.FILESYSTEM,
        `Reading directory: ${path}`,
        'safeFileHandling',
        { path, recursive: options?.recursive }
      );
      
      // Perform the operation
      const entries = await readDir(path, options);
      
      // Sanitize entries
      const sanitizedEntries: SafeDirectoryEntry[] = entries.map(entry => ({
        name: sanitizeFileName(entry.name || ''),
        path: entry.path,
        children: entry.children ? entry.children.map(child => ({
          name: sanitizeFileName(child.name || ''),
          path: child.path,
          isDirectory: child.children !== undefined,
          isFile: !child.children,
          isSymlink: false // Tauri API doesn't expose this information directly
        })) : undefined,
        isDirectory: entry.children !== undefined,
        isFile: !entry.children,
        isSymlink: false // Tauri API doesn't expose this information directly
      }));
      
      return sanitizedEntries;
    } catch (error) {
      // Handle and log errors
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      const fileError = new FileOperationError(
        `Failed to read directory: ${(error as Error)?.message || 'Unknown error'}`,
        path,
        error,
        'readDir'
      );
      
      securityLogger.error(
        SecurityCategory.FILESYSTEM,
        `Failed to read directory: ${path}`,
        'safeFileHandling',
        { error, path }
      );
      
      throw fileError;
    }
  }
);

/**
 * Safe implementation of createDir with security checks
 */
export const safeCreateDir = withCapabilities(
  [
    {
      category: CapabilityCategory.FS,
      name: 'createDir',
      description: 'Ability to create directories in the filesystem',
      severity: 'high'
    }
  ],
  async (path: string, options?: { recursive?: boolean }): Promise<void> => {
    try {
      // Validate path
      if (!isValidFilePath(path)) {
        const error = new FileOperationError(
          `Invalid directory path: ${path}`,
          path,
          null,
          'createDir'
        );
        
        securityLogger.error(
          SecurityCategory.FILESYSTEM,
          `Attempted to create invalid directory: ${path}`,
          'safeFileHandling',
          { path }
        );
        
        throw error;
      }
      
      // Log the operation
      securityLogger.info(
        SecurityCategory.FILESYSTEM,
        `Creating directory: ${path}`,
        'safeFileHandling',
        { path, recursive: options?.recursive }
      );
      
      // Perform the operation
      await createDir(path, options);
    } catch (error) {
      // Handle and log errors
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      const fileError = new FileOperationError(
        `Failed to create directory: ${(error as Error)?.message || 'Unknown error'}`,
        path,
        error,
        'createDir'
      );
      
      securityLogger.error(
        SecurityCategory.FILESYSTEM,
        `Failed to create directory: ${path}`,
        'safeFileHandling',
        { error, path }
      );
      
      throw fileError;
    }
  }
);

/**
 * Safe implementation of removeDir with security checks
 */
export const safeRemoveDir = withCapabilities(
  [
    {
      category: CapabilityCategory.FS,
      name: 'removeDir',
      description: 'Ability to remove directories from the filesystem',
      severity: 'high'
    }
  ],
  async (path: string, options?: { recursive?: boolean }): Promise<void> => {
    try {
      // Validate path
      if (!isValidFilePath(path)) {
        const error = new FileOperationError(
          `Invalid directory path: ${path}`,
          path,
          null,
          'removeDir'
        );
        
        securityLogger.error(
          SecurityCategory.FILESYSTEM,
          `Attempted to remove invalid directory: ${path}`,
          'safeFileHandling',
          { path }
        );
        
        throw error;
      }
      
      // Log the operation with warning for recursive
      if (options?.recursive) {
        securityLogger.warning(
          SecurityCategory.FILESYSTEM,
          `Recursively removing directory: ${path}`,
          'safeFileHandling',
          { path }
        );
      } else {
        securityLogger.info(
          SecurityCategory.FILESYSTEM,
          `Removing directory: ${path}`,
          'safeFileHandling',
          { path }
        );
      }
      
      // Perform the operation
      await removeDir(path, options);
    } catch (error) {
      // Handle and log errors
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      const fileError = new FileOperationError(
        `Failed to remove directory: ${(error as Error)?.message || 'Unknown error'}`,
        path,
        error,
        'removeDir'
      );
      
      securityLogger.error(
        SecurityCategory.FILESYSTEM,
        `Failed to remove directory: ${path}`,
        'safeFileHandling',
        { error, path }
      );
      
      throw fileError;
    }
  }
);

/**
 * Safe implementation of removeFile with security checks
 */
export const safeRemoveFile = withCapabilities(
  [
    {
      category: CapabilityCategory.FS,
      name: 'removeFile',
      description: 'Ability to remove files from the filesystem',
      severity: 'high'
    }
  ],
  async (path: string): Promise<void> => {
    try {
      // Validate path
      if (!isValidFilePath(path)) {
        const error = new FileOperationError(
          `Invalid file path: ${path}`,
          path,
          null,
          'removeFile'
        );
        
        securityLogger.error(
          SecurityCategory.FILESYSTEM,
          `Attempted to remove invalid file: ${path}`,
          'safeFileHandling',
          { path }
        );
        
        throw error;
      }
      
      // Log the operation
      securityLogger.info(
        SecurityCategory.FILESYSTEM,
        `Removing file: ${path}`,
        'safeFileHandling',
        { path }
      );
      
      // Perform the operation
      await removeFile(path);
    } catch (error) {
      // Handle and log errors
      if (error instanceof FileOperationError) {
        throw error;
      }
      
      const fileError = new FileOperationError(
        `Failed to remove file: ${(error as Error)?.message || 'Unknown error'}`,
        path,
        error,
        'removeFile'
      );
      
      securityLogger.error(
        SecurityCategory.FILESYSTEM,
        `Failed to remove file: ${path}`,
        'safeFileHandling',
        { error, path }
      );
      
      throw fileError;
    }
  }
);

/**
 * Example usage:
 * 
 * import { safeReadTextFile, safeWriteTextFile } from './safeFileHandling';
 * 
 * async function readConfig() {
 *   try {
 *     const content = await safeReadTextFile('config.json');
 *     return JSON.parse(content);
 *   } catch (error) {
 *     console.error('Failed to read config:', error);
 *     return null;
 *   }
 * }
 * 
 * async function saveConfig(config: object) {
 *   try {
 *     await safeWriteTextFile('config.json', JSON.stringify(config, null, 2));
 *     return true;
 *   } catch (error) {
 *     console.error('Failed to save config:', error);
 *     return false;
 *   }
 * }
 */ 