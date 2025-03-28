# Initialize git repository
Write-Host "Initializing git repository..." -ForegroundColor Green
git init

# Add all files to staging
Write-Host "Adding files to staging..." -ForegroundColor Green
git add .

# Initial commit
Write-Host "Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit: Tauri 2.0 Security Boilerplate"

# Add remote repository
Write-Host "Adding remote repository..." -ForegroundColor Green
git remote add origin https://github.com/Gcavazo1/tauri-security-boilerplate.git

# Create main branch if it doesn't exist
Write-Host "Ensuring main branch exists..." -ForegroundColor Green
git branch -M main

Write-Host "=====================================================`n" -ForegroundColor Cyan
Write-Host "Repository setup complete!" -ForegroundColor Green
Write-Host "Run the following command to push your code:`n" -ForegroundColor Yellow
Write-Host "git push -u origin main" -ForegroundColor Yellow
Write-Host "`n=====================================================" -ForegroundColor Cyan 