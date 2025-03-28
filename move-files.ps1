# PowerShell script to move all files from tauri-boilerplate to root directory

Write-Host "Moving files from tauri-boilerplate to root directory..." -ForegroundColor Green

# Copy all files (including hidden files)
Get-ChildItem -Path ".\tauri-boilerplate" -Force | ForEach-Object {
    $destinationPath = Join-Path -Path ".\" -ChildPath $_.Name
    
    # Check if it's a directory
    if ($_.PSIsContainer) {
        # Create the directory if it doesn't exist
        if (-not (Test-Path -Path $destinationPath -PathType Container)) {
            Write-Host "Creating directory: $($_.Name)" -ForegroundColor Cyan
            New-Item -Path $destinationPath -ItemType Directory -Force | Out-Null
        }
        
        # Copy directory contents recursively
        Write-Host "Copying directory contents: $($_.Name)" -ForegroundColor Cyan
        Copy-Item -Path "$($_.FullName)\*" -Destination $destinationPath -Recurse -Force
    } else {
        # Copy file
        Write-Host "Copying file: $($_.Name)" -ForegroundColor Cyan
        Copy-Item -Path $_.FullName -Destination $destinationPath -Force
    }
}

Write-Host "`nMove complete!" -ForegroundColor Green
Write-Host "You can now remove the tauri-boilerplate directory with: Remove-Item -Path '.\tauri-boilerplate' -Recurse -Force" -ForegroundColor Yellow 