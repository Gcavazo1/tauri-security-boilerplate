#!/bin/bash

# Shell script to move all files from tauri-boilerplate to root directory

echo "Moving files from tauri-boilerplate to root directory..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Create directories first
for dir in $(find ./tauri-boilerplate -type d -not -path "./tauri-boilerplate"); do
    # Extract the relative path
    rel_dir=${dir#./tauri-boilerplate/}
    
    if [ ! -z "$rel_dir" ]; then
        echo "Creating directory: $rel_dir"
        mkdir -p "./$rel_dir"
    fi
done

# Copy all files (including hidden files)
for file in $(find ./tauri-boilerplate -type f -not -path "*/\.*"); do
    # Extract the relative path
    rel_file=${file#./tauri-boilerplate/}
    
    echo "Copying file: $rel_file"
    cp "$file" "./$rel_file"
done

# Copy hidden files (if any)
for file in $(find ./tauri-boilerplate -name ".*" -type f); do
    # Extract the relative path
    rel_file=${file#./tauri-boilerplate/}
    
    if [ ! -z "$rel_file" ]; then
        echo "Copying hidden file: $rel_file"
        cp "$file" "./$rel_file"
    fi
done

echo ""
echo "Move complete!"
echo "You can now remove the tauri-boilerplate directory with: rm -rf ./tauri-boilerplate" 