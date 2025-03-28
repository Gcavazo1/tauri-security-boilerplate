// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;

use log::{info, error, warn, LevelFilter};
use std::process;

fn main() {
    // Initialize logging
    env_logger::Builder::new()
        .filter_level(LevelFilter::Info)
        .parse_default_env()
        .init();
    
    info!("Starting application with enhanced security features");
    
    // Run the Tauri application with security features
    match run() {
        Ok(_) => info!("Application exited successfully"),
        Err(e) => {
            error!("Application error: {}", e);
            process::exit(1);
        }
    }
}

fn run() -> Result<(), Box<dyn std::error::Error>> {
    // Build the Tauri application with security features
    tauri::Builder::default()
        // Register the security command handlers
        .setup(|app| {
            info!("Setting up application with security enhancements");
            Ok(())
        })
        // Register security utilities
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window::init())
        .plugin(tauri_plugin_fs::init())
        // Register our security commands
        .invoke_handler(tauri::generate_handler![
            utils::memory_safe::handle_sensitive_data,
            utils::memory_safe::validate_and_process_path,
        ])
        .run(tauri::generate_context!())
        .map_err(|e| {
            error!("Failed to run application: {}", e);
            e.into()
        })
} 