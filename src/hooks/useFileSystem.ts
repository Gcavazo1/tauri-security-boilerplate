import { useState, useCallback } from 'react';
import { getFileInfo, listDirectoryFiles, selectDirectory, selectFiles, FileInfo } from '../utils/api/tauriApi';
import { useAppStore } from '../stores/appStore';
import { open } from '@tauri-apps/plugin-dialog';

/**
 * Custom hook for file system operations
 * Provides a clean interface to Tauri's file system commands with proper loading/error states
 */
interface UseFileSystemReturnType {
  isLoading: boolean;
  error: Error | null;
  getFileDetails: (filePath: string) => Promise<FileInfo | null>;
  listFiles: (dirPath: string, recursive?: boolean) => Promise<FileInfo[]>;
  browseDirectory: () => Promise<string | null>;
  browseFiles: () => Promise<string[]>;
}

export function useFileSystem(): UseFileSystemReturnType {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { setError: setGlobalError } = useAppStore();

  /**
   * Get detailed information about a file
   */
  const getFileDetails = useCallback(async (filePath: string): Promise<FileInfo | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fileInfo = await getFileInfo(filePath);
      return fileInfo;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setGlobalError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  /**
   * List files in a directory
   */
  const listFiles = useCallback(async (dirPath: string, recursive = false): Promise<FileInfo[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await listDirectoryFiles(dirPath, recursive);
      return files.map(file => ({
        id: file.id || crypto.randomUUID(),
        name: file.name || '',
        path: file.path || '',
        isDirectory: file.isDirectory || false,
        size: file.size || 0,
        lastModified: file.lastModified || Date.now() / 1000,
        fileType: file.fileType || ''
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setGlobalError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  /**
   * Open directory selection dialog
   */
  const browseDirectory = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const selectedDir = await open({
        directory: true,
        multiple: false,
      });
      
      return selectedDir ? selectedDir.toString() : null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setGlobalError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  /**
   * Open file selection dialog
   */
  const browseFiles = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const selectedFiles = await selectFiles();
      return selectedFiles;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setGlobalError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  return {
    isLoading,
    error,
    getFileDetails,
    listFiles,
    browseDirectory,
    browseFiles
  };
}