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
  secureStorage,
  safeGet,
  createSafeIpc,
  isPrimitive,
  withCapabilities,
  verifyResourceIntegrity
} from '../utils/security';
import ErrorBoundary from '../components/ErrorBoundary';
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
  result?: {
    ok: boolean;
    value?: any;
    error?: string;
  };
}

// Create safe IPC functions
const getUserData = createSafeIpc<{ userId: string }, UserData>({
  command: 'get_user_data',
  validateParams: (params): params is { userId: string } => (
    typeof params === 'object' && 
    params !== null && 
    typeof (params as any).userId === 'string'
  ),
  validateResult: createUserDataValidator,
  sanitizeStringParams: true,
});

// Create a secure component with capability requirements
const SecureUserProfile = withCapabilities({
  required: ['fs:read-user-data'],
  fallback: <div>Permission to read user data is required</div>
})(() => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Verify application integrity before loading sensitive data
    verifyResourceIntegrity()
      .then(integrityVerified => {
        if (!integrityVerified) {
          securityLogger.error(
            SecurityCategory.DATA_ACCESS,
            'Resource integrity check failed',
            'SecureUserProfile'
          );
          setError('Security check failed. Application may be compromised.');
          setLoading(false);
          return;
        }
        
        // Load cached user data from secure storage
        const cachedData = secureStorage.getItem('userData');
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            if (createUserDataValidator(parsedData)) {
              setUserData(parsedData);
              setLoading(false);
              
              securityLogger.info(
                SecurityCategory.DATA_ACCESS,
                'Loaded user data from secure storage',
                'SecureUserProfile'
              );
            }
          } catch (e) {
            securityLogger.warning(
              SecurityCategory.DATA_ACCESS,
              'Failed to parse cached user data',
              'SecureUserProfile',
              { error: e instanceof Error ? e.message : String(e) }
            );
          }
        }
        
        // Load fresh user data
        loadUserData();
      });
  }, []);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get the current user ID (in a real app, this would come from auth context)
      const userId = 'current-user';
      
      // Use safe IPC to get user data
      const result = await getUserData({ userId });
      
      if (result.ok) {
        setUserData(result.value);
        
        // Cache in secure storage
        secureStorage.setItem('userData', JSON.stringify(result.value));
        
        securityLogger.info(
          SecurityCategory.DATA_ACCESS,
          'Successfully loaded user data',
          'SecureUserProfile'
        );
      } else {
        throw result.error;
      }
    } catch (e) {
      securityLogger.error(
        SecurityCategory.DATA_ACCESS,
        'Failed to load user data',
        'SecureUserProfile',
        { error: e instanceof Error ? e.message : String(e) }
      );
      
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading user data securely...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!userData) {
    return <div>No user data available</div>;
  }
  
  return (
    <div className="secure-profile">
      <h2>User Profile</h2>
      <div className="profile-content">
        <p><strong>ID:</strong> {userData.id}</p>
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Role:</strong> {userData.role}</p>
        <p><strong>Status:</strong> {userData.status}</p>
      </div>
      
      <button onClick={loadUserData}>Refresh Securely</button>
    </div>
  );
});

/**
 * Main example component showing how to use security features together
 */
const SecurityUsageExample: React.FC = () => {
  // Wrapped in an error boundary for graceful error handling
  return (
    <ErrorBoundary fallback={<div>Something went wrong loading the secure component</div>}>
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
          <SecureUserProfile />
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Example of using secure network requests
const fetchUserFromApi = async () => {
  try {
    const result = await secureGet<UserData>({
      url: 'https://api.example.com/users/123',
      validateResponse: true,
      timeout: 5000
    });
    
    return { ...result, result: { ok: true, value: result } };
  } catch (err) {
    return {
      id: '',
      name: '',
      email: '',
      role: '',
      status: 'inactive',
      result: { ok: false, error: (err as Error).message }
    };
  }
};

// Example of using secure storage
const storeUserData = async (userData: UserData) => {
  try {
    const storage = getSecureStorage();
    await storage.setItem('user', JSON.stringify(userData));
  } catch (err) {
    console.error(`Storage error: ${(err as Error).message}`);
  }
};

export default SecurityUsageExample; 