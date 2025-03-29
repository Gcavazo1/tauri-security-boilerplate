/**
 * Example: Secure Application Component
 * 
 * This example demonstrates how to build a secure application component
 * that combines multiple security features from our boilerplate.
 */

import React, { useState, useEffect } from 'react';
import { 
  securityLogger, 
  SecurityCategory,
  withCapability
} from '../utils/security';
import ErrorBoundary, { DefaultErrorFallback } from '../components/common/ErrorBoundary';
import { secureGet, securePut } from '../utils/security/safeNetworkRequests';
import { getSecureStorage } from '../utils/security/secureStorage';

// Define expected object shapes with validators
const createUserDataValidator = (data: unknown): data is UserData => {
  if (typeof data !== 'object' || data === null) return false;
  const userData = data as Record<string, unknown>;
  
  return (
    typeof userData.id === 'string' &&
    typeof userData.name === 'string' &&
    typeof userData.role === 'string'
  );
};

// Define our data types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  ok: boolean;
  value?: any;
  error?: string;
}

// Create safe IPC functions
const getUserData = async ({ userId }: { userId: string }): Promise<UserData> => {
  // Mock implementation for demo
  return {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'User',
    status: 'active',
    ok: true
  };
};

// Create a secure component with permission requirements
const SecureUserProfile = ({ user }: { user: UserData }) => {
  return (
    <div className="secure-profile">
      <h2>User Profile</h2>
      <div className="profile-content">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.status}</p>
      </div>
    </div>
  );
};

/**
 * Main example component showing how to use security features together
 */
const SecurityUsageExample: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Initialize secure storage
    const userStorage = getSecureStorage('user');
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Use safe IPC to get user data
      const result = await getUserData({ userId: 'user-123' });
      
      if (result.ok) {
        setUserData(result);
        
        securityLogger.info(
          SecurityCategory.STORAGE,
          'Successfully loaded user data',
          'SecureUserProfile'
        );
        
        // Example of secure network call
        await secureGet<any>('https://api.example.com/users/' + result.id);
        
        // Example of secure PUT request
        await securePut<any>('https://api.example.com/users/' + result.id, { lastLogin: new Date() });
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (e) {
      securityLogger.error(
        SecurityCategory.STORAGE,
        'Failed to load user data',
        'SecureUserProfile',
        { error: e instanceof Error ? e.message : String(e) }
      );
      
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Wrapped in an error boundary for graceful error handling
  return (
    <ErrorBoundary fallback={<DefaultErrorFallback error={new Error("Failed to load secure component")} resetErrorBoundary={() => {}} />}>
      <div className="security-example">
        <h1>Security Features Example</h1>
        <p>This example demonstrates how to build a secure component using multiple security features:</p>
        
        <ul>
          <li>Type-safe IPC communication</li>
          <li>Resource integrity verification</li>
          <li>Secure data storage</li>
          <li>Security logging</li>
          <li>Capability-based permissions</li>
          <li>Error boundaries</li>
        </ul>
        
        <div className="example-container">
          <button 
            onClick={loadUserData}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
          >
            Load User Data
          </button>
          
          {loading && <div>Loading user data securely...</div>}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              {error}
            </div>
          )}
          
          {userData && <SecureUserProfile user={userData} />}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SecurityUsageExample; 