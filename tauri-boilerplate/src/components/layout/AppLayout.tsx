import React from 'react';
import { useAppStore } from '../../stores/appStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout that provides consistent structure
 * Includes responsive header, navigation sidebar, and content area
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { darkMode, toggleDarkMode } = useAppStore();
  
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* App Header */}
      <header className={`px-4 py-3 flex items-center justify-between border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center">
          <svg 
            className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
            />
          </svg>
          <h1 className="ml-2 text-xl font-semibold">Tauri App</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme toggle button */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className={`w-64 p-4 border-r ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <ul className="space-y-2">
            <li>
              <a href="#" className={`block px-4 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>Dashboard</a>
            </li>
            <li>
              <a href="#" className={`block px-4 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>Files</a>
            </li>
            <li>
              <a href="#" className={`block px-4 py-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>Settings</a>
            </li>
          </ul>
        </nav>
        
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <footer className={`px-6 py-4 border-t text-center text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
        Tauri App Template &copy; {new Date().getFullYear()} - Built with Tauri, React and TypeScript
      </footer>
    </div>
  );
};

export default AppLayout; 