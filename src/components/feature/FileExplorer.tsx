import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../../hooks/useFileSystem';
import { FileInfo } from '../../utils/api/tauriApi';
import { formatErrorMessage } from '../../utils/helpers/errorHandling';

/**
 * FileExplorer component demonstrates file system operations
 * Shows how to use the useFileSystem hook for browsing files and directories
 */
const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const { isLoading, error, listFiles, browseDirectory } = useFileSystem();

  // Load files for the current directory
  useEffect(() => {
    if (currentPath) {
      loadFiles(currentPath);
    }
  }, [currentPath]);

  const loadFiles = async (dirPath: string) => {
    try {
      const fileList = await listFiles(dirPath, false);
      setFiles(fileList);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const handleBrowse = async () => {
    try {
      const selectedDir = await browseDirectory();
      if (selectedDir) {
        setCurrentPath(selectedDir);
      }
    } catch (err) {
      console.error('Failed to browse directory:', err);
    }
  };

  const handleFileClick = async (file: FileInfo) => {
    if (file.isDirectory) {
      setCurrentPath(file.path);
    } else {
      // For files, you could open them or show details
      alert(`File: ${file.name}\nSize: ${formatFileSize(file.size)}\nLast modified: ${formatDate(file.lastModified)}`);
    }
  };

  const navigateToParent = () => {
    if (!currentPath) return;
    
    const parentPath = currentPath.split(/[\\/]/).slice(0, -1).join('/');
    if (parentPath) {
      setCurrentPath(parentPath);
    }
  };

  // Utility function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Utility function to format date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">File Explorer</h2>
      
      <div className="flex items-center mb-4">
        <button
          onClick={handleBrowse}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          Browse Directory
        </button>
        
        {currentPath && (
          <button
            onClick={navigateToParent}
            className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            Parent Directory
          </button>
        )}
      </div>
      
      {/* Current path display */}
      {currentPath && (
        <div className="text-sm mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-auto dark:text-gray-200">
          <span className="font-mono">{currentPath}</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
          {formatErrorMessage(error)}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* File list */}
      {!isLoading && files.length > 0 && (
        <div className="border dark:border-gray-700 rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Modified</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file) => (
                <tr 
                  key={file.id} 
                  onClick={() => handleFileClick(file)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        {/* File/Folder icon */}
                        {file.isDirectory ? (
                          <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {file.isDirectory ? 'Folder' : file.fileType || 'File'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {file.isDirectory ? '--' : formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(file.lastModified)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && currentPath && files.length === 0 && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-300">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <p>This directory is empty</p>
        </div>
      )}
      
      {/* Initial state */}
      {!isLoading && !currentPath && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-300">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Click 'Browse Directory' to start exploring files</p>
        </div>
      )}
    </div>
  );
};

export default FileExplorer; 