import { useState, useCallback, useEffect } from 'react';
import { getFileInfo, selectFiles, FileInfo } from '../utils/api/tauriApi';
import { useAppStore } from '../stores/appStore';
import { open } from '@tauri-apps/plugin-dialog';
import { FileEntry, FileResponse, listDirectoryFiles, selectDirectory } from '../utils/security/tauriApi';
import { securityLogger, SecurityCategory } from '../utils/security/securityLogger';

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

interface UseFileSystemProps {
  initialDirectory?: string;
  autoLoad?: boolean;
}

interface UseFileSystemResult {
  files: FileEntry[];
  currentDirectory: string | null;
  isLoading: boolean;
  error: string | null;
  listFiles: (directory?: string) => Promise<void>;
  selectAndLoadDirectory: () => Promise<string | undefined>;
}

export function useFileSystem({
  initialDirectory,
  autoLoad = false
}: UseFileSystemProps = {}): UseFileSystemResult {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(initialDirectory || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setGlobalError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  /**
   * List files in a directory
   */
  const listFiles = useCallback(async (directory?: string): Promise<void> => {
    // If no directory is specified, use the current directory
    const targetDir = directory || currentDirectory;
    if (!targetDir) {
      setError('No directory specified');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      securityLogger.info(
        SecurityCategory.FILE_SYSTEM,
        `Listing files in directory: ${targetDir}`,
        'useFileSystem.listFiles'
      );

      const response: FileResponse = await listDirectoryFiles(targetDir);
      
      if (response.error) {
        setError(response.error);
      } else {
        setFiles(response.files);
        setCurrentDirectory(targetDir);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to list files: ${errorMessage}`);
      securityLogger.error(
        SecurityCategory.FILE_SYSTEM,
        `Error listing files: ${errorMessage}`,
        'useFileSystem.listFiles',
        { directory: targetDir, error: err }
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentDirectory]);
  
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
      setError(error.message);
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
      setError(error.message);
      setGlobalError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  /**
   * Select and load a directory
   */
  const selectAndLoadDirectory = useCallback(async (): Promise<string | undefined> => {
    try {
      setIsLoading(true);
      setError(null);
      
      securityLogger.info(
        SecurityCategory.FILE_SYSTEM,
        'Opening directory selection dialog',
        'useFileSystem.selectAndLoadDirectory'
      );
      
      const selectedDir = await selectDirectory();
      
      if (selectedDir) {
        // Update the current directory and list files
        setCurrentDirectory(selectedDir);
        await listFiles(selectedDir);
        return selectedDir;
      }
      return undefined;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to select directory: ${errorMessage}`);
      securityLogger.error(
        SecurityCategory.FILE_SYSTEM,
        `Error selecting directory: ${errorMessage}`,
        'useFileSystem.selectAndLoadDirectory',
        { error: err }
      );
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [listFiles]);

  // Load files when the component mounts if autoLoad is true
  useEffect(() => {
    if (autoLoad && currentDirectory) {
      listFiles(currentDirectory).catch((err) => {
        console.error('Failed to auto-load directory:', err);
      });
    }
  }, [autoLoad, currentDirectory, listFiles]);

  return {
    files,
    currentDirectory,
    isLoading,
    error,
    listFiles,
    selectAndLoadDirectory
  };
}