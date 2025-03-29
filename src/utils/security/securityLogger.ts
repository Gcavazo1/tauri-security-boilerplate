/**
 * Security logger for tracking and auditing security-relevant events
 * 
 * This module provides:
 * 1. Security event logging
 * 2. Categorization of security events
 * 3. Severity levels for triage
 * 4. Context collection for forensics
 * 5. Structured output for analysis
 */

// Security event categories
export enum SecurityCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  FILE_SYSTEM = 'file-system',
  NETWORK = 'network',
  STORAGE = 'storage',
  VALIDATION = 'validation',
  SANITIZATION = 'sanitization',
  INTEGRITY = 'integrity',
  CONFIGURATION = 'configuration',
  API = 'api',
  GENERAL = 'general'
}

// Security log levels
export enum SecurityLogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Timestamp formatting
const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

// Base log function
/* eslint-disable no-console */
const logEvent = (
  level: SecurityLogLevel,
  category: SecurityCategory,
  message: string,
  source: string,
  context?: Record<string, unknown>
) => {
  const timestamp = formatTimestamp();
  const logEntry = {
    timestamp,
    level,
    category,
    message,
    source,
    ...(context ? { context } : {})
  };

  // In a production app, we would send this to a secure logging service
  // or write it to a secure audit log file
  // For development, we log to console
  switch (level) {
    case SecurityLogLevel.DEBUG:
      console.debug('[SECURITY]', JSON.stringify(logEntry));
      break;
    case SecurityLogLevel.INFO:
      console.info('[SECURITY]', JSON.stringify(logEntry));
      break;
    case SecurityLogLevel.WARN:
      console.warn('[SECURITY]', JSON.stringify(logEntry));
      break;
    case SecurityLogLevel.ERROR:
    case SecurityLogLevel.CRITICAL:
      console.error('[SECURITY]', JSON.stringify(logEntry));
      break;
  }
  
  return logEntry;
};
/* eslint-enable no-console */

// Security logger singleton
export const securityLogger = {
  debug: (
    category: SecurityCategory,
    message: string,
    source: string,
    context?: Record<string, unknown>
  ) => logEvent(SecurityLogLevel.DEBUG, category, message, source, context),
  
  info: (
    category: SecurityCategory,
    message: string,
    source: string,
    context?: Record<string, unknown>
  ) => logEvent(SecurityLogLevel.INFO, category, message, source, context),
  
  warn: (
    category: SecurityCategory,
    message: string,
    source: string,
    context?: Record<string, unknown>
  ) => logEvent(SecurityLogLevel.WARN, category, message, source, context),
  
  error: (
    category: SecurityCategory,
    message: string,
    source: string,
    context?: Record<string, unknown>
  ) => logEvent(SecurityLogLevel.ERROR, category, message, source, context),
  
  critical: (
    category: SecurityCategory,
    message: string,
    source: string,
    context?: Record<string, unknown>
  ) => logEvent(SecurityLogLevel.CRITICAL, category, message, source, context)
}; 