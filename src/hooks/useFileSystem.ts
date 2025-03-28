import { useState, useCallback } from 'react';
import { getFileInfo, listDirectoryFiles, selectDirectory, selectFiles, FileInfo } from '../utils/api/tauriApi';
import { useAppStore } from '../stores/appStore';

/**
 * Custom hook for file system operations
 * Provides a clean interface to Tauri's file system commands with proper loading/error states
 */
export function useFileSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to get file details';
      setError(errorMessage);
      setGlobalError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  /**
   * List files in a directory
   */
  const listFiles = useCallback(async (directoryPath: string, filesOnly = false): Promise<FileInfo[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await listDirectoryFiles(directoryPath, filesOnly);
      return files;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list directory contents';
      setError(errorMessage);
      setGlobalError(errorMessage);
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
      const selectedDir = await selectDirectory();
      return selectedDir;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open directory browser';
      setError(errorMessage);
      setGlobalError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to open file browser';
      setError(errorMessage);
      setGlobalError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  return {
    getFileDetails,
    listFiles,
    browseDirectory,
    browseFiles,
    isLoading,
    error
  };
}