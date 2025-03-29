/**
 * Safe IPC (Inter-Process Communication) module for Tauri applications
 * 
 * This module provides secure wrappers around Tauri's IPC mechanisms:
 * 1. Command validation and sanitization
 * 2. Proper payload handling
 * 3. Input validation
 * 4. Security context awareness
 * 5. Secure event handling
 */

import { securityLogger, SecurityCategory } from './securityLogger';

/**
 * Security-focused utility to validate command payloads
 * @param commandName The command name being validated
 * @param payload The payload to validate
 * @returns Whether the payload is valid
 */
export function validateCommandPayload<T>(
  commandName: string,
  payload: T,
  schema?: Record<string, any>
): boolean {
  try {
    // Log the validation attempt
    securityLogger.info(
      SecurityCategory.VALIDATION,
      `Validating payload for command: ${commandName}`,
      'validateCommandPayload',
      { commandName }
    );
    
    // Basic checks - ensure the payload exists
    if (payload === undefined || payload === null) {
      securityLogger.warn(
        SecurityCategory.VALIDATION,
        `Null or undefined payload for command: ${commandName}`,
        'validateCommandPayload',
        { commandName }
      );
      return false;
    }
    
    // If a schema is provided, validate against it
    if (schema) {
      // In a real implementation, we would use a schema validation library
      // like Zod, Yup, or JSON Schema to validate the payload
      
      // This is a simplified example
      const keys = Object.keys(schema);
      for (const key of keys) {
        const fieldSchema = schema[key];
        const value = (payload as any)[key];
        
        // Check required fields
        if (fieldSchema.required && (value === undefined || value === null)) {
          securityLogger.warn(
            SecurityCategory.VALIDATION,
            `Missing required field ${key} for command: ${commandName}`,
            'validateCommandPayload',
            { commandName, field: key }
          );
          return false;
        }
        
        // Check field type
        if (value !== undefined && typeof value !== fieldSchema.type) {
          securityLogger.warn(
            SecurityCategory.VALIDATION,
            `Invalid type for field ${key} in command: ${commandName}`,
            'validateCommandPayload',
            { commandName, field: key, expected: fieldSchema.type, received: typeof value }
          );
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    securityLogger.error(
      SecurityCategory.VALIDATION,
      `Error validating payload: ${error instanceof Error ? error.message : String(error)}`,
      'validateCommandPayload',
      { commandName, error }
    );
    return false;
  }
}

/**
 * Interface for safe IPC command handlers
 */
export interface SafeCommandHandler<TPayload, TResult> {
  commandName: string;
  handler: (payload: TPayload) => Promise<TResult>;
  schema?: Record<string, any>;
}

/**
 * Register a secure command handler
 * This provides a wrapper for Tauri commands with security validations
 * @param commandHandler The command handler definition
 */
export function registerSafeCommand<TPayload, TResult>(
  commandHandler: SafeCommandHandler<TPayload, TResult>
): (payload: TPayload) => Promise<TResult> {
  // In a real implementation, this would register with Tauri's command system
  // For now, this is a wrapper that adds security checks
  
  return async (payload: TPayload): Promise<TResult> => {
    try {
      // Log the command invocation
      securityLogger.info(
        SecurityCategory.API,
        `Command invoked: ${commandHandler.commandName}`,
        'registerSafeCommand',
        { commandName: commandHandler.commandName }
      );
      
      // Validate the payload
      const isValid = validateCommandPayload(
        commandHandler.commandName, 
        payload, 
        commandHandler.schema
      );
      
      if (!isValid) {
        securityLogger.warn(
          SecurityCategory.VALIDATION,
          `Invalid payload for command: ${commandHandler.commandName}`,
          'registerSafeCommand',
          { commandName: commandHandler.commandName, payload }
        );
        
        throw new Error(`Invalid payload for command: ${commandHandler.commandName}`);
      }
      
      // Execute the command handler
      const result = await commandHandler.handler(payload);
      
      return result;
    } catch (error) {
      securityLogger.error(
        SecurityCategory.API,
        `Error executing command ${commandHandler.commandName}: ${error instanceof Error ? error.message : String(error)}`,
        'registerSafeCommand',
        { commandName: commandHandler.commandName, error }
      );
      
      throw error;
    }
  };
}

/**
 * Safe event emitter for IPC events
 * @param eventName The name of the event to emit
 * @param payload The event payload
 */
export async function safeEmitEvent<T>(eventName: string, payload: T): Promise<void> {
  try {
    // Log the event emission
    securityLogger.info(
      SecurityCategory.API,
      `Emitting event: ${eventName}`,
      'safeEmitEvent',
      { eventName }
    );
    
    // In a real implementation, this would use Tauri's event system
    // For now, this is a placeholder
    
    // Mock event emission
    console.log(`[Event ${eventName}]`, payload);
  } catch (error) {
    securityLogger.error(
      SecurityCategory.API,
      `Error emitting event ${eventName}: ${error instanceof Error ? error.message : String(error)}`,
      'safeEmitEvent',
      { eventName, error }
    );
    
    throw error;
  }
}

/**
 * Safe event listener for IPC events
 * @param eventName The name of the event to listen for
 * @param handler The event handler
 * @returns A function to unsubscribe from the event
 */
export function safeListenEvent<T>(
  eventName: string,
  handler: (payload: T) => void
): () => void {
  try {
    // Log the event listener registration
    securityLogger.info(
      SecurityCategory.API,
      `Registering event listener for: ${eventName}`,
      'safeListenEvent',
      { eventName }
    );
    
    // In a real implementation, this would use Tauri's event system
    // For now, this is a placeholder
    
    // Return an unsubscribe function
    return () => {
      securityLogger.info(
        SecurityCategory.API,
        `Unregistering event listener for: ${eventName}`,
        'safeListenEvent',
        { eventName }
      );
    };
  } catch (error) {
    securityLogger.error(
      SecurityCategory.API,
      `Error registering event listener for ${eventName}: ${error instanceof Error ? error.message : String(error)}`,
      'safeListenEvent',
      { eventName, error }
    );
    
    // Return a no-op unsubscribe function
    return () => {};
  }
} 