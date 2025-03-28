// Add security-focused comments
#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
#![allow(clippy::needless_return)]

// Import modules
mod utils;

// Import required dependencies
use log::{info, error, LevelFilter};
use std::process;

// Security-focused error handling
#[tauri::command]
fn handle_error(error_message: String) -> Result<(), String> {
    error!("Application error: {}", error_message);
    Err(error_message)
}

// Greet command implementation
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Main entry point for the library
pub fn run() {
    // Initialize logging
    env_logger::Builder::new()
        .filter_level(LevelFilter::Info)
        .parse_default_env()
        .init();
    
    info!("Starting application with enhanced security features");
    
    // Run the Tauri application with security features
    match run_app() {
        Ok(_) => info!("Application exited successfully"),
        Err(e) => {
            error!("Application error: {}", e);
            process::exit(1);
        }
    }
}

// Function to set up and run the Tauri application
fn run_app() -> Result<(), Box<dyn std::error::Error>> {
    // Build the Tauri application with security features
    tauri::Builder::default()
        // Register the security command handlers
        .setup(|_app| {
            info!("Setting up application with security enhancements");
            Ok(())
        })
        // Register security plugins
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        // Register our security commands
        .invoke_handler(tauri::generate_handler![
            handle_error,
            greet,
            utils::memory_safe::handle_sensitive_data,
            utils::memory_safe::validate_and_process_path,
        ])
        .run(tauri::generate_context!())
        .map_err(|e| {
            error!("Failed to run application: {}", e);
            e.into()
        })
} 