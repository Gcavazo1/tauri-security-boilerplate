import React, { useState, useEffect } from 'react';
import { secureGet } from '../utils/security/safeNetworkRequests';
import { getSecureStorage } from '../utils/security/secureStorage';
import { verifyResourceIntegrity } from '../utils/security/resourceIntegrity';
import ErrorBoundary, { DefaultErrorFallback } from '../components/common/ErrorBoundary';
import { securityLogger, SecurityCategory } from '../utils/security/securityLogger';

// Define user profile type
interface SecureUserProfile {
  username: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
  permissions: string[];
  lastLogin: number;
}

/**
 * Example component demonstrating the usage of security utilities
 */
const SecurityUsage: React.FC = () => {
  const [userData, setUserData] = useState<SecureUserProfile | null>(null);
  const [isResourceValid, setIsResourceValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkIntegrity = async () => {
      // Verify resource integrity
      const isValid = await verifyResourceIntegrity();
      setIsResourceValid(isValid);

      if (!isValid) {
        securityLogger.warning(
          SecurityCategory.INTEGRITY,
          "Resource integrity check failed",
          "SecurityUsage.checkIntegrity"
        );
        setError("Resource integrity verification failed. Application may be compromised.");
        return;
      }

      // Fetch user data
      await fetchUserData();
    };

    checkIntegrity();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Example: Fetch user data from a secure endpoint
      const apiResponse = await secureGet<SecureUserProfile>('https://api.example.com/user/profile');
      
      // Store the user data securely
      const userStorage = getSecureStorage('user');
      await userStorage.setItem('user_data', JSON.stringify(apiResponse));
      
      // Retrieve the stored data to verify it was stored correctly
      const storedData = await userStorage.getItem('user_data');
      
      if (storedData) {
        setUserData(JSON.parse(storedData));
      } else {
        setError('Failed to retrieve user data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      securityLogger.error(
        SecurityCategory.NETWORK,
        `Failed to fetch user data: ${errorMessage}`,
        'SecurityUsage.fetchUserData',
        { error: err }
      );
      setError(`An error occurred: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary fallback={<DefaultErrorFallback error={new Error("Security usage page error")} resetErrorBoundary={() => {}} />}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Security Features Demo</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!isResourceValid && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Resource integrity check failed. Application may be compromised.
          </div>
        )}
        
        {isLoading ? (
          <div className="text-gray-600">Loading user data...</div>
        ) : userData ? (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl mb-2">User Profile</h2>
            <dl className="grid grid-cols-2 gap-2">
              <dt className="font-semibold">Username:</dt>
              <dd>{userData.username}</dd>
              
              <dt className="font-semibold">Email:</dt>
              <dd>{userData.email}</dd>
              
              <dt className="font-semibold">Theme:</dt>
              <dd>{userData.preferences.theme}</dd>
              
              <dt className="font-semibold">Notifications:</dt>
              <dd>{userData.preferences.notifications ? 'Enabled' : 'Disabled'}</dd>
              
              <dt className="font-semibold">Permissions:</dt>
              <dd>{userData.permissions.join(', ')}</dd>
              
              <dt className="font-semibold">Last Login:</dt>
              <dd>{new Date(userData.lastLogin).toLocaleString()}</dd>
            </dl>
          </div>
        ) : (
          <div className="text-gray-600">No user data available</div>
        )}
        
        <button
          onClick={() => fetchUserData()}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Refresh User Data'}
        </button>
      </div>
    </ErrorBoundary>
  );
};

export default SecurityUsage; 