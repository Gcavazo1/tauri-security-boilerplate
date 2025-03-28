#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use std::path::Path;
use std::fs;
use serde::{Serialize, Deserialize};
use tauri_plugin_dialog::DialogExt;

// Common data structures
#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    id: String,
    name: String,
    path: String,
    is_directory: bool,
    size: u64,
    last_modified: u64,
    file_type: String,
}

// Helper function for consistent error formatting and logging
fn log_error(message: &str) -> String {
    println!("Error: {}", message);
    message.to_string()
}

// Example command that demonstrates error handling
#[tauri::command]
fn greet(name: String) -> Result<String, String> {
    if name.is_empty() {
        return Err("Name cannot be empty".to_string());
    }
    Ok(format!("Hello, {}! Welcome to Tauri.", name))
}

// File system example command with proper error handling
#[tauri::command]
fn get_file_info(file_path: String) -> Result<FileInfo, String> {
    println!("get_file_info command called for: {}", file_path);
    
    let path_obj = Path::new(&file_path);
    
    if !path_obj.exists() {
        return Err(log_error(&format!("File does not exist: {}", file_path)));
    }
    
    // Get file metadata
    let metadata = std::fs::metadata(path_obj).map_err(|e| {
        log_error(&format!("Failed to read metadata for {:?}: {}", path_obj, e))
    })?;
    
    // Get file name
    let file_name = path_obj.file_name()
        .ok_or_else(|| log_error(&format!("Could not determine filename for {:?}", path_obj)))?
        .to_string_lossy()
        .to_string();
    
    // Get file extension
    let file_type = path_obj.extension()
        .map(|ext| ext.to_string_lossy().to_string())
        .unwrap_or_else(|| "".to_string());
    
    // Get last modified time
    let last_modified = metadata.modified()
        .map(|time| time.duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0))
        .unwrap_or(0);
    
    Ok(FileInfo {
        id: uuid::Uuid::new_v4().to_string(),
        name: file_name,
        path: file_path,
        is_directory: metadata.is_dir(),
        size: metadata.len(),
        last_modified,
        file_type,
    })
}

// List files in a directory with proper error handling
#[tauri::command]
fn list_directory_files(dir_path: String, files_only: Option<bool>) -> Result<Vec<FileInfo>, String> {
    println!("list_directory_files command called for: {}", dir_path);
    
    let path = Path::new(&dir_path);
    
    if !path.exists() {
        return Err(log_error(&format!("Directory does not exist: {}", dir_path)));
    }
    
    if !path.is_dir() {
        return Err(log_error(&format!("Path is not a directory: {}", dir_path)));
    }
    
    let entries = match fs::read_dir(path) {
        Ok(entries) => entries,
        Err(e) => {
            return Err(log_error(&format!("Failed to read directory: {}", e)));
        }
    };
    
    let mut files = Vec::new();
    let should_filter_dirs = files_only.unwrap_or(false);
    
    for entry in entries {
        match entry {
            Ok(entry) => {
                let path = entry.path();
                
                // Skip if we can't get metadata
                let metadata = match fs::metadata(&path) {
                    Ok(meta) => meta,
                    Err(_) => continue,
                };
                
                // Skip directories if files_only is true
                if should_filter_dirs && metadata.is_dir() {
                    continue;
                }
                
                // Skip if we can't get the filename
                let file_name = match path.file_name() {
                    Some(name) => name.to_string_lossy().to_string(),
                    None => continue,
                };
                
                // Get file extension
                let file_type = path.extension()
                    .map(|ext| ext.to_string_lossy().to_string())
                    .unwrap_or_else(|| "".to_string());
                
                // Get last modified time
                let last_modified = metadata.modified()
                    .map(|time| time.duration_since(std::time::UNIX_EPOCH)
                        .map(|d| d.as_secs())
                        .unwrap_or(0))
                    .unwrap_or(0);
                
                files.push(FileInfo {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: file_name,
                    path: path.to_string_lossy().to_string(),
                    is_directory: metadata.is_dir(),
                    size: metadata.len(),
                    last_modified,
                    file_type,
                });
            },
            Err(_) => continue,
        }
    }
    
    // Sort files alphabetically
    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    
    Ok(files)
}

// Select directory with proper dialog permission handling
#[tauri::command]
async fn select_directory(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let dialog = app.dialog();
    
    let result = dialog.folder()
        .await
        .map_err(|e| format!("Failed to open folder dialog: {}", e))?;
    
    match result {
        Some(path) => Ok(Some(path.to_string_lossy().to_string())),
        None => Ok(None), // User cancelled selection
    }
}

// Select files with proper dialog permission handling
#[tauri::command]
async fn select_files(app: tauri::AppHandle) -> Result<Option<Vec<String>>, String> {
    let dialog = app.dialog();
    
    let result = dialog.open_multiple()
        .await
        .map_err(|e| format!("Failed to open file dialog: {}", e))?;
    
    match result {
        Some(paths) => {
            let string_paths = paths.iter()
                .map(|path| path.to_string_lossy().to_string())
                .collect();
            Ok(Some(string_paths))
        }
        None => Ok(None), // User cancelled selection
    }
}

// Application entry point
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Enable file system and dialog access with proper permission handling
            app.handle().plugin(tauri_plugin_fs::init()).unwrap();
            app.handle().plugin(tauri_plugin_dialog::init()).unwrap();
            
            // Log successful setup
            println!("App setup complete with permissions initialized");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_file_info,
            list_directory_files,
            select_directory,
            select_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 