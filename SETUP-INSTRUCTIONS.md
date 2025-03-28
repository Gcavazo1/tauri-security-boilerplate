# Setup Instructions

This document provides step-by-step instructions for setting up and pushing the Tauri Security Boilerplate to your GitHub repository.

## Prerequisites

- Git installed on your system
- GitHub account
- A GitHub repository created at: https://github.com/Gcavazo1/tauri-security-boilerplate

## Setup Steps

### Option 1: Using the Provided Scripts (Recommended)

#### For Windows Users:

1. First, move the files from the `tauri-boilerplate` directory to the root:
   ```powershell
   # Run in PowerShell
   .\move-files.ps1
   ```

2. Push the project to GitHub:
   ```powershell
   # Run in PowerShell
   .\push-to-github.ps1
   ```

3. Remove the original `tauri-boilerplate` directory:
   ```powershell
   # Run in PowerShell
   Remove-Item -Path '.\tauri-boilerplate' -Recurse -Force
   ```

#### For macOS/Linux Users:

1. First, make the scripts executable:
   ```bash
   chmod +x move-files.sh push-to-github.sh
   ```

2. Move the files from the `tauri-boilerplate` directory to the root:
   ```bash
   ./move-files.sh
   ```

3. Push the project to GitHub:
   ```bash
   ./push-to-github.sh
   ```

4. Remove the original `tauri-boilerplate` directory:
   ```bash
   rm -rf ./tauri-boilerplate
   ```

### Option 2: Manual Setup

If you prefer to set up the repository manually, follow these steps:

1. Move the files from `tauri-boilerplate` to the root directory manually.

2. Initialize the Git repository:
   ```bash
   git init
   ```

3. Add the remote repository:
   ```bash
   git remote add origin https://github.com/Gcavazo1/tauri-security-boilerplate.git
   ```

4. Add all files to the staging area:
   ```bash
   git add .
   ```

5. Commit the changes:
   ```bash
   git commit -m "Initial commit: Tauri Security Boilerplate"
   ```

6. Create and switch to the main branch:
   ```bash
   git branch -M main
   ```

7. Push to GitHub:
   ```bash
   git push -u origin main
   ```

## Verification

After pushing to GitHub, verify that:

1. All files appear in your GitHub repository
2. The GitHub Actions workflows are properly set up (check the Actions tab)
3. The README is correctly displayed on the repository's main page

## Next Steps

Once your repository is set up, you can:

1. Clone it to your development environment:
   ```bash
   git clone https://github.com/Gcavazo1/tauri-security-boilerplate.git
   cd tauri-security-boilerplate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize pre-commit hooks:
   ```bash
   npm run prepare
   ```

4. Start the development server:
   ```bash
   npm run tauri:dev
   ```

## Troubleshooting

If you encounter any issues:

1. **Authentication errors**: Make sure you have the correct GitHub credentials or have set up SSH keys.
2. **Permission denied**: Ensure your GitHub user has write access to the repository.
3. **Missing files**: Double-check that all files were properly moved from the `tauri-boilerplate` directory.
4. **Git conflicts**: If you're getting conflicts, try using `git pull` before pushing again, or consider using `git push -f` (use with caution). 