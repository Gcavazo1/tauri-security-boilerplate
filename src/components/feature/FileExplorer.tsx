import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../../hooks/useFileSystem';
import { FileEntry } from '../../utils/security/tauriApi';
import { formatErrorMessage } from '../../utils/helpers/errorHandling';

/**
 * FileExplorer component demonstrates file system operations
 * Shows how to use the useFileSystem hook for browsing files and directories
 */
const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const { isLoading, error, listFiles, selectAndLoadDirectory } = useFileSystem();

  // Load files from the given directory
  const loadFiles = async (dirPath: string) => {
    setCurrentPath(dirPath);
    await listFiles(dirPath);
  };

  // Handle clicking on a directory to navigate into it
  const handleDirectoryClick = async (path: string) => {
    await loadFiles(path);
  };

  // Handle browse directory button click
  const handleBrowseClick = async () => {
    try {
      const selectedDir = await selectAndLoadDirectory();
      // Only clear files if no directory was selected (this shouldn't happen normally because
      // files are already updated in selectAndLoadDirectory)
      if (selectedDir === undefined) {
        setFiles([]);
      }
    } catch (error) {
      console.error('Failed to browse directory:', error);
    }
  };

  return (
    <div className="file-explorer bg-white p-4 rounded shadow-sm">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">File Explorer</h2>
        <button 
          onClick={handleBrowseClick}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Browse
        </button>
      </div>

      {currentPath && (
        <div className="mb-2 text-sm text-gray-600">
          Current path: {currentPath}
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {formatErrorMessage(error)}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-4">
          <span className="text-gray-500">Loading...</span>
        </div>
      ) : (
        <div className="border rounded">
          {files.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No files to display. Please browse a directory.
            </div>
          ) : (
            <ul className="divide-y">
              {files.map((file) => (
                <li 
                  key={file.path}
                  className="p-2 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => file.isDirectory && handleDirectoryClick(file.path)}
                >
                  <span className="mr-2">
                    {file.isDirectory ? '📁' : '📄'}
                  </span>
                  <span>{file.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default FileExplorer; 