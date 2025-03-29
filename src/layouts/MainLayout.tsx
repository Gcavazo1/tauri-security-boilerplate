import { Outlet } from 'react-router-dom';
import { useState } from 'react';

/**
 * Main layout component for the application
 * Contains the header, navigation, and footer
 */
const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Tauri Security Boilerplate</h1>
              <button
                onClick={toggleDarkMode}
                className="px-3 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Tauri Security Boilerplate - Built with security in mind.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout; 