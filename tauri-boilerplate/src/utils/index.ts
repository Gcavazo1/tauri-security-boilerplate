/**
 * Main utilities index file
 * 
 * This file exports all utility categories to make them easier to import.
 */

// Re-export all security utilities
export * as security from './security';

// Re-export all helper utilities
export * as helpers from './helpers';

/**
 * Example usage:
 * 
 * // Import specific utilities from categories
 * import { security, helpers } from '../../utils';
 * 
 * // Use utilities from different categories
 * security.securityLogger.info(
 *   security.SecurityCategory.AUTHORIZATION,
 *   'User action logged',
 *   'Component'
 * );
 * 
 * const safeFilename = helpers.sanitizeFileName(userInput);
 * 
 * // Or import specific utilities directly
 * import { security } from '../../utils';
 * const { safeReadTextFile, securityLogger } = security;
 * 
 * // This organization makes the codebase more maintainable
 */ 