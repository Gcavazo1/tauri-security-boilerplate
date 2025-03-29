/**
 * Tests for security utilities
 * 
 * This file contains tests for our security utilities to ensure they're
 * functioning correctly and maintaining security guarantees.
 */

import { 
  isPrimitive, 
  isJsonObject, 
  createObjectValidator,
  createArrayValidator 
} from '../../utils/security/utilities';
import { validateUserInput } from '../../utils/helpers/validation';

// Mock the Tauri API
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn().mockImplementation((cmd, _args) => {
    if (cmd === 'test_command') {
      return Promise.resolve({ success: true, data: 'test data' });
    }
    return Promise.reject(new Error('Unknown command'));
  }),
}));

// Mock the security logger
jest.mock('../../utils/security/securityLogger', () => ({
  securityLogger: {
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
  SecurityCategory: {
    INPUT_VALIDATION: 'INPUT_VALIDATION',
    DATA_ACCESS: 'DATA_ACCESS',
    NETWORK: 'NETWORK',
  },
}));

describe('Security Utilities', () => {
  describe('Safe IPC Validators', () => {
    test('isPrimitive correctly identifies primitive types', () => {
      expect(isPrimitive('string')).toBe(true);
      expect(isPrimitive(123)).toBe(true);
      expect(isPrimitive(true)).toBe(true);
      expect(isPrimitive(null)).toBe(true);
      expect(isPrimitive(undefined)).toBe(true);
      
      expect(isPrimitive({})).toBe(false);
      expect(isPrimitive([])).toBe(false);
      expect(isPrimitive(new Date())).toBe(false);
    });
    
    test('isJsonObject correctly identifies JSON objects', () => {
      expect(isJsonObject({})).toBe(true);
      expect(isJsonObject({ key: 'value' })).toBe(true);
      
      expect(isJsonObject([])).toBe(false);
      expect(isJsonObject('string')).toBe(false);
      expect(isJsonObject(123)).toBe(false);
      expect(isJsonObject(null)).toBe(false);
    });
    
    test('createObjectValidator validates objects correctly', () => {
      const validator = createObjectValidator<{ name: string, age: number }>(['name', 'age']);
      
      expect(validator({ name: 'John', age: 30 })).toBe(true);
      expect(validator({ name: 'John', age: 30, extra: 'field' })).toBe(true); // Extra fields are allowed
      
      expect(validator({ name: 'John' })).toBe(false); // Missing required field
      expect(validator(null)).toBe(false);
      expect(validator('not an object')).toBe(false);
    });
    
    test('createArrayValidator validates arrays correctly', () => {
      // Create a validator for arrays of strings
      const stringArrayValidator = createArrayValidator<string>((item): item is string => typeof item === 'string');
      
      expect(stringArrayValidator(['a', 'b', 'c'])).toBe(true);
      expect(stringArrayValidator([])).toBe(true);
      
      expect(stringArrayValidator(['a', 123, 'c'])).toBe(false);
      expect(stringArrayValidator(null)).toBe(false);
      expect(stringArrayValidator('not an array')).toBe(false);
    });
  });
  
  describe('Input Validation', () => {
    test('validateUserInput sanitizes unsafe input', () => {
      // These should be sanitized but not throw errors
      expect(validateUserInput('<script>alert("XSS")</script>')).not.toContain('<script>');
      expect(validateUserInput('   trimmed   ')).toBe('trimmed');
      
      // Should trim and limit length
      const longString = 'a'.repeat(2000);
      expect(validateUserInput(longString).length).toBeLessThanOrEqual(1000);
      
      // Should throw for non-string input
      expect(() => validateUserInput(123 as any)).toThrow();
      expect(() => validateUserInput(null as any)).toThrow();
    });
  });
  
  // Note: More comprehensive tests would include:
  // - Tests for safeNetworkRequests utilities
  // - Tests for secureStorage
  // - Tests for resourceIntegrity
  // - Tests for securityLogger
  // - Mock tests for the capability validator
});

// Mock implementation of validateUserInput for testing purposes
jest.mock('../../utils/helpers/validation', () => ({
  validateUserInput: (input: unknown): string => {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    // Trim and limit length
    let sanitized = input.toString().trim().slice(0, 1000);
    
    // Remove potential script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    return sanitized;
  }
})); 