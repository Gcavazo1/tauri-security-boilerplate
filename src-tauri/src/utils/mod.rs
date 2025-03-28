/// Utilities for the Tauri application
///
/// This module contains various utilities for enhancing application security,
/// including memory-safe data handling, secure sanitization, and validation.
// Export the memory-safe submodule
pub mod memory_safe;

// Include tests in test mode
#[cfg(test)]
mod memory_safe_tests;
