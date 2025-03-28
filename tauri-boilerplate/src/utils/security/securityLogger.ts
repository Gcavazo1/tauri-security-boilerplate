/**
 * Security logging utility for tracking security-relevant events
 * Helps detect potential security incidents and assists in forensic analysis
 */

// Security event severity levels
export enum SecurityLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// Security event categories
export enum SecurityCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA_ACCESS = 'DATA_ACCESS',
  INPUT_VALIDATION = 'INPUT_VALIDATION',
  FILESYSTEM = 'FILESYSTEM',
  NETWORK = 'NETWORK',
  CONFIGURATION = 'CONFIGURATION',
  DEPENDENCY = 'DEPENDENCY',
}

// Interface for security events
export interface SecurityEvent {
  timestamp: string;
  level: SecurityLevel;
  category: SecurityCategory;
  message: string;
  source: string;
  data?: unknown;
}

/**
 * Central security logging class
 * Logs security-relevant events with appropriate context
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  private logs: SecurityEvent[] = [];
  private maxLogsInMemory: number = 1000;
  private logToConsole: boolean = true;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  /**
   * Configure logger settings
   */
  public configure(options: { maxLogsInMemory?: number; logToConsole?: boolean }): void {
    if (options.maxLogsInMemory !== undefined) {
      this.maxLogsInMemory = options.maxLogsInMemory;
    }
    if (options.logToConsole !== undefined) {
      this.logToConsole = options.logToConsole;
    }
  }

  /**
   * Log a security event
   */
  public log(
    level: SecurityLevel,
    category: SecurityCategory,
    message: string,
    source: string,
    data?: unknown
  ): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      source,
      data,
    };

    // Add to in-memory log
    this.logs.push(event);

    // Trim logs if they exceed the maximum
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }

    // Log to console if enabled
    if (this.logToConsole) {
      const consoleMethod = this.getConsoleMethod(level);
      consoleMethod(
        `[SECURITY][${event.timestamp}][${level}][${category}] ${message}`,
        data ? data : ''
      );
    }

    // For critical events, we could implement additional reporting
    // mechanisms here, such as sending to a backend service
    if (level === SecurityLevel.CRITICAL) {
      this.reportCriticalEvent(event);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  public info(
    category: SecurityCategory,
    message: string,
    source: string,
    data?: unknown
  ): void {
    this.log(SecurityLevel.INFO, category, message, source, data);
  }

  public warning(
    category: SecurityCategory,
    message: string,
    source: string,
    data?: unknown
  ): void {
    this.log(SecurityLevel.WARNING, category, message, source, data);
  }

  public error(
    category: SecurityCategory,
    message: string,
    source: string,
    data?: unknown
  ): void {
    this.log(SecurityLevel.ERROR, category, message, source, data);
  }

  public critical(
    category: SecurityCategory,
    message: string,
    source: string,
    data?: unknown
  ): void {
    this.log(SecurityLevel.CRITICAL, category, message, source, data);
  }

  /**
   * Get all security logs (for admin interfaces, debugging)
   */
  public getLogs(): SecurityEvent[] {
    return [...this.logs];
  }

  /**
   * Filter logs by various criteria
   */
  public filterLogs(options: {
    level?: SecurityLevel;
    category?: SecurityCategory;
    startTime?: string;
    endTime?: string;
    source?: string;
  }): SecurityEvent[] {
    return this.logs.filter((log) => {
      let matches = true;
      
      if (options.level && log.level !== options.level) {
        matches = false;
      }
      
      if (options.category && log.category !== options.category) {
        matches = false;
      }
      
      if (options.source && log.source !== options.source) {
        matches = false;
      }
      
      if (options.startTime && log.timestamp < options.startTime) {
        matches = false;
      }
      
      if (options.endTime && log.timestamp > options.endTime) {
        matches = false;
      }
      
      return matches;
    });
  }

  /**
   * Clear all logs (use with caution)
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs to JSON string
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs);
  }

  /**
   * Map security level to console method
   */
  private getConsoleMethod(level: SecurityLevel): (...data: any[]) => void {
    switch (level) {
      case SecurityLevel.INFO:
        return console.info;
      case SecurityLevel.WARNING:
        return console.warn;
      case SecurityLevel.ERROR:
      case SecurityLevel.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Handle reporting of critical security events
   * In a production app, this would likely send to a backend service
   */
  private reportCriticalEvent(event: SecurityEvent): void {
    // In production, implement more robust reporting here
    console.error('CRITICAL SECURITY EVENT', event);
    
    // This is where you would integrate with your security monitoring
    // For example, sending to a backend API or local storage
    // that is regularly checked
  }
}

// Export a default instance for convenience
export const securityLogger = SecurityLogger.getInstance();

/**
 * Example usage:
 * 
 * import { securityLogger, SecurityCategory } from './securityLogger';
 * 
 * // Log an authentication attempt
 * securityLogger.info(
 *   SecurityCategory.AUTHENTICATION,
 *   'User login attempt',
 *   'LoginComponent',
 *   { username: 'user123', success: true }
 * );
 * 
 * // Log a file access attempt
 * securityLogger.warning(
 *   SecurityCategory.FILESYSTEM,
 *   'Attempted to access restricted file',
 *   'FileManager',
 *   { path: '/etc/passwd', user: 'user123' }
 * );
 */ 