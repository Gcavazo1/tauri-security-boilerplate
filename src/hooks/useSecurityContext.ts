import { useCallback, useContext, createContext, ReactNode, useState } from 'react';
import { securityLogger, SecurityCategory } from '../utils/security/securityLogger';
import { Capability } from '../utils/security/capabilityValidator';
import React from 'react';

/**
 * Interface for the security context value
 */
interface SecurityContextValue {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
  capabilities: Capability[];
  hasCapability: (capability: Capability) => boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

/**
 * Default security context
 */
const defaultSecurityContext: SecurityContextValue = {
  isAuthenticated: false,
  username: null,
  roles: [],
  capabilities: [],
  hasCapability: () => false,
  login: async () => false,
  logout: () => {}
};

/**
 * Create security context
 */
const SecurityContext = createContext<SecurityContextValue>(defaultSecurityContext);

/**
 * Props for the security provider
 */
interface SecurityProviderProps {
  children: ReactNode;
}

/**
 * Security context provider component
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  
  /**
   * Check if the user has a specific capability
   */
  const hasCapability = useCallback((capability: Capability): boolean => {
    return capabilities.includes(capability);
  }, [capabilities]);
  
  /**
   * Mock login function - in a real app, this would call an API
   */
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      // In a real app, we would validate credentials against a backend service
      securityLogger.info(
        SecurityCategory.AUTHENTICATION,
        `Login attempt for user: ${username}`,
        'SecurityProvider.login'
      );
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock authentication - always succeeds
      // In a real app, this would depend on credentials being valid
      setIsAuthenticated(true);
      setUsername(username);
      
      // Mock roles and capabilities assignments
      // In a real app, these would come from the authentication service
      setRoles(['user']);
      setCapabilities([
        Capability.READ_FILES, 
        Capability.WRITE_FILES
      ]);
      
      securityLogger.info(
        SecurityCategory.AUTHENTICATION,
        `Login successful for user: ${username}`,
        'SecurityProvider.login'
      );
      
      return true;
    } catch (error) {
      securityLogger.error(
        SecurityCategory.AUTHENTICATION,
        `Login failed for user: ${username}`,
        'SecurityProvider.login',
        { error }
      );
      return false;
    }
  }, []);
  
  /**
   * Logout function
   */
  const logout = useCallback(() => {
    securityLogger.info(
      SecurityCategory.AUTHENTICATION,
      `Logout for user: ${username}`,
      'SecurityProvider.logout'
    );
    
    setIsAuthenticated(false);
    setUsername(null);
    setRoles([]);
    setCapabilities([]);
  }, [username]);
  
  const value: SecurityContextValue = {
    isAuthenticated,
    username,
    roles,
    capabilities,
    hasCapability,
    login,
    logout
  };
  
  return React.createElement(
    SecurityContext.Provider,
    { value },
    children
  );
}

/**
 * Custom hook to access the security context
 */
export function useSecurityContext(): SecurityContextValue {
  const context = useContext(SecurityContext);
  
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  
  return context;
} 