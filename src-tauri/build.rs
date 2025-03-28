fn main() {
    println!("cargo:rustc-env=TAURI_SKIP_RESOURCE_FILE=1");
    tauri_build::build();
}
