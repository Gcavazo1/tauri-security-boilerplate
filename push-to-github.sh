#!/bin/bash

# Shell script to push the project to GitHub

echo "========== Pushing Tauri Security Boilerplate to GitHub =========="
echo "This script will push the project to your GitHub repository."
echo "Make sure you have already run the move-files.sh script!"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install it first."
    exit 1
fi

# Check if repository is already initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    
    # Add remote repository
    echo "Adding remote repository..."
    git remote add origin https://github.com/Gcavazo1/tauri-security-boilerplate.git
else
    echo "Git repository already initialized."
fi

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Initial commit: Tauri Security Boilerplate"

# Make sure we're on the main branch
echo "Ensuring main branch..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
echo "You may be prompted for your GitHub credentials."
git push -u origin main

echo "=========================================================="
echo "Project pushed to GitHub successfully!"
echo "Check your repository at: https://github.com/Gcavazo1/tauri-security-boilerplate"
echo "===========================================================" 