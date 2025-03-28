import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

// Define error handling for Tauri commands
export class TauriApiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'TauriApiError';
  }
}

// Generic wrapper for invoke calls with proper error handling
export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw new TauriApiError(
      `Failed to execute command '${command}': ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

// Example command: greeting
export async function greet(name: string): Promise<string> {
  return invokeCommand<string>('greet', { name });
}

// File system utilities
export interface FileInfo {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  lastModified: number;
  fileType: string;
}

export async function getFileInfo(filePath: string): Promise<FileInfo> {
  return invokeCommand<FileInfo>('get_file_info', { filePath });
}

// Dialog utilities
export async function selectDirectory(): Promise<string | null> {
  try {
    const result = await invokeCommand<string[]>('select_directory');
    return result && result.length > 0 ? result[0] : null;
  } catch (error) {
    throw new TauriApiError(
      `Failed to select directory: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

export async function selectFiles(): Promise<string[]> {
  try {
    const selected = await open({
      multiple: true,
      filters: [{
        name: 'All Files',
        extensions: ['*']
      }]
    });

    if (!selected) {
      return [];
    }

    return Array.isArray(selected) ? selected : [selected];
  } catch (error) {
    throw new TauriApiError(
      `Failed to select files: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
} 