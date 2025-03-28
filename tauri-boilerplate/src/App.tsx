import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Button from './components/common/Button';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useAppStore } from './stores/appStore';
import { greet, selectFiles } from './utils/api/tauriApi';

function App() {
  const { darkMode, toggleDarkMode, isLoading, setLoading, error, setError, clearError } = useAppStore();
  const [name, setName] = useState<string>('');
  const [greeting, setGreeting] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Handle greet command
  const handleGreet = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      clearError();
      const result = await greet(name);
      setGreeting(result);
    } catch (err) {
      setError(`Failed to greet: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleSelectFiles = async () => {
    try {
      setLoading(true);
      clearError();
      const files = await selectFiles();
      setSelectedFiles(files);
    } catch (err) {
      setError(`Failed to select files: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="prose dark:prose-invert max-w-none">
        <h1>Welcome to Tauri App Template</h1>
        <p>
          This template provides a starting point for building Tauri applications with 
          React, TypeScript, and Tailwind CSS.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">Theme Toggle Example</h2>
          <Button onClick={toggleDarkMode}>
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </Button>
        </div>

        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 rounded shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">Tauri Command Example</h2>
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button onClick={handleGreet} isLoading={isLoading}>
                  Greet
                </Button>
              </div>
              
              {greeting && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  {greeting}
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
                  {error}
                  <button 
                    onClick={clearError}
                    className="ml-2 text-xs text-red-600 dark:text-red-400 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 rounded shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">File Dialog Example</h2>
            <div className="flex flex-col space-y-4">
              <Button onClick={handleSelectFiles} isLoading={isLoading} variant="secondary">
                Select Files
              </Button>
              
              {selectedFiles.length > 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                  <h3 className="font-medium mb-2">Selected Files:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="truncate text-sm">
                        {file}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </ErrorBoundary>
      </div>

      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>
          Check out the source code to learn more about how to build Tauri apps
          with best practices for security, performance, and user experience.
        </p>
      </div>
    </Layout>
  );
}

export default App; 