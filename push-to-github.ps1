# PowerShell script to push the project to GitHub

Write-Host "========== Pushing Tauri Security Boilerplate to GitHub ==========" -ForegroundColor Cyan
Write-Host "This script will push the project to your GitHub repository." -ForegroundColor Yellow
Write-Host "Make sure you have already run the move-files.ps1 script!" -ForegroundColor Yellow

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: git is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if repository is already initialized
if (-not (Test-Path -Path ".git" -PathType Container)) {
    Write-Host "Initializing git repository..." -ForegroundColor Green
    git init
    
    # Add remote repository
    Write-Host "Adding remote repository..." -ForegroundColor Green
    git remote add origin https://github.com/Gcavazo1/tauri-security-boilerplate.git
} else {
    Write-Host "Git repository already initialized." -ForegroundColor Green
}

# Add all files
Write-Host "Adding files to git..." -ForegroundColor Green
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Green
git commit -m "Initial commit: Tauri Security Boilerplate"

# Make sure we're on the main branch
Write-Host "Ensuring main branch..." -ForegroundColor Green
git branch -M main

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green
Write-Host "You may be prompted for your GitHub credentials." -ForegroundColor Yellow
git push -u origin main

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Project pushed to GitHub successfully!" -ForegroundColor Green
Write-Host "Check your repository at: https://github.com/Gcavazo1/tauri-security-boilerplate" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan 