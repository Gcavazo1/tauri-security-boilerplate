//! Build script for the Tauri application
//! This sets up environment variables and resources for the Tauri context

use std::env;
use std::path::Path;

fn main() {
    // Print OUT_DIR to understand the build environment
    let out_dir = env::var("OUT_DIR").unwrap_or_else(|_| "OUT_DIR not set".to_string());
    println!("cargo:warning=OUT_DIR is set to: {}", out_dir);
    
    // Skip creating a resource file on Windows for better security
    println!("cargo:rustc-env=TAURI_SKIP_RESOURCE_FILE=1");
    
    // Set rerun-if-changed directives to make sure Cargo recompiles when Tauri config or capabilities change
    println!("cargo:rerun-if-changed=tauri.conf.json");
    println!("cargo:rerun-if-changed=capabilities");
    
    // Also rebuild when source files change
    println!("cargo:rerun-if-changed=src");
    
    // Check if tauri.conf.json exists
    let conf_path = Path::new("tauri.conf.json");
    if conf_path.exists() {
        println!("cargo:warning=Found tauri.conf.json");
    } else {
        println!("cargo:warning=tauri.conf.json not found in current directory");
        println!("cargo:warning=Current dir: {}", env::current_dir().unwrap().display());
    }
    
    // Finally, build Tauri context
    tauri_build::build();
}
