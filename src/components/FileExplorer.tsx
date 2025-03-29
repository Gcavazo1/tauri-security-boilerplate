import React, { useState } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { securityLogger, SecurityCategory } from '../utils/security/securityLogger';

interface FileExplorerProps {
  initialDirectory?: string;
}

export function FileExplorer({ initialDirectory }: FileExplorerProps) {
  const {
    files,
    currentDirectory,
    isLoading,
    error,
    listFiles,
    selectAndLoadDirectory
  } = useFileSystem({ 
    initialDirectory,
    autoLoad: Boolean(initialDirectory)
  });

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // Handle file selection
  const handleFileClick = (path: string) => {
    setSelectedFile(path);
    securityLogger.info(
      SecurityCategory.FILE_SYSTEM,
      `File selected: ${path}`,
      'FileExplorer.handleFileClick'
    );
  };

  // Handle directory change
  const handleDirectoryChange = async () => {
    await selectAndLoadDirectory();
  };

  // Refresh current directory
  const handleRefresh = async () => {
    if (currentDirectory) {
      await listFiles(currentDirectory);
    }
  };

  return (
    <div className="file-explorer p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">File Explorer</h2>
        <div className="space-x-2">
          <button 
            onClick={handleDirectoryChange}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Select Directory
          </button>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            disabled={!currentDirectory}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {currentDirectory && (
        <div className="mb-4 text-sm bg-gray-100 p-2 rounded">
          <span className="font-medium">Current directory:</span> {currentDirectory}
        </div>
      )}
      
      {error && (
        <div className="mb-4 text-sm bg-red-100 text-red-800 p-2 rounded">
          Error: {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <div className="border rounded">
          {files.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {currentDirectory ? 'No files in this directory' : 'Select a directory to view files'}
            </div>
          ) : (
            <ul className="divide-y">
              {files.map((file) => (
                <li 
                  key={file.path}
                  onClick={() => handleFileClick(file.path)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedFile === file.path ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center">
                    <span className={`mr-2 ${file.isDirectory ? 'text-blue-500' : 'text-gray-500'}`}>
                      {file.isDirectory ? '📁' : '📄'}
                    </span>
                    <span>{file.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 