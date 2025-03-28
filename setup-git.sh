#!/bin/bash

# Initialize git repository
echo "Initializing git repository..."
git init

# Add all files to staging
echo "Adding files to staging..."
git add .

# Initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: Tauri 2.0 Security Boilerplate"

# Add remote repository
echo "Adding remote repository..."
git remote add origin https://github.com/Gcavazo1/tauri-security-boilerplate.git

# Create main branch if it doesn't exist
echo "Ensuring main branch exists..."
git branch -M main

echo "=====================================================\n"
echo "Repository setup complete!"
echo "Run the following command to push your code:\n"
echo "git push -u origin main"
echo "\n=====================================================" 