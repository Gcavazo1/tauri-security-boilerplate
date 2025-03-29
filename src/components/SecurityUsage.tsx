import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { DefaultErrorFallback } from './DefaultErrorFallback';
import { securityLogger, SecurityCategory } from '../utils/security/securityLogger';

// Import security utilities
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { secureStore, secureRetrieve, secureDelete } from '../utils/security/secureStorage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { secureGet, securePost } from '../utils/security/safeNetworkRequests';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { withCapabilities, createUserDataValidator } from '../utils/security/securityHelpers';

// Interface for user data
interface UserData {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

// Security Usage Component - Shows how to use the security utilities
export function SecurityUsage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Log security event
        securityLogger.info(
          SecurityCategory.STORAGE,
          'Loading user data from secure storage',
          'SecurityUsage.loadUserData'
        );
        
        // In a real app, this would retrieve actual data from secure storage
        // For demo purposes, we're creating mock data
        const mockUser: UserData = {
          id: 'user-123',
          name: 'Test User',
          email: 'user@example.com',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUserData(mockUser);
        setMessage('User data loaded successfully');
      } catch (error) {
        securityLogger.error(
          SecurityCategory.STORAGE,
          `Failed to load user data: ${error instanceof Error ? error.message : String(error)}`,
          'SecurityUsage.loadUserData',
          { error }
        );
        setMessage(`Error loading data: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // Handle save user data
  const handleSaveUser = async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      
      securityLogger.info(
        SecurityCategory.STORAGE,
        'Saving user data to secure storage',
        'SecurityUsage.handleSaveUser'
      );
      
      // In a real app, this would save to secure storage
      // secureStore('user', userData, true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('User data saved securely');
    } catch (error) {
      securityLogger.error(
        SecurityCategory.STORAGE,
        `Failed to save user data: ${error instanceof Error ? error.message : String(error)}`,
        'SecurityUsage.handleSaveUser',
        { error }
      );
      setMessage(`Error saving data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user data
  const handleDeleteUser = async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      
      securityLogger.info(
        SecurityCategory.STORAGE,
        'Deleting user data from secure storage',
        'SecurityUsage.handleDeleteUser'
      );
      
      // In a real app, this would delete from secure storage
      // secureDelete('user');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData(null);
      setMessage('User data deleted securely');
    } catch (error) {
      securityLogger.error(
        SecurityCategory.STORAGE,
        `Failed to delete user data: ${error instanceof Error ? error.message : String(error)}`,
        'SecurityUsage.handleDeleteUser',
        { error }
      );
      setMessage(`Error deleting data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary fallback={<DefaultErrorFallback />}>
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Security Utilities Demo</h2>
        
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <p className="text-sm">{message || 'Interact with secure storage functions'}</p>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {userData ? (
              <div className="mb-4">
                <h3 className="font-medium mb-2">User Data:</h3>
                <pre className="bg-gray-50 p-2 rounded text-sm">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="mb-4 text-gray-500">No user data loaded</p>
            )}
            
            <div className="flex gap-2">
              <button 
                onClick={handleSaveUser}
                disabled={!userData}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Save User Data
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={!userData}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Delete User Data
              </button>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
} 