$sourcePath = "C:\Users\turhv\OneDrive\שולחן העבודה\Studies\year 1\semester 2\*"
$destinationPath = "C:\Users\turhv\OneDrive\שולחן העבודה\Studies\year 1\study-tracker\public\files"

Write-Host "Syncing files from OneDrive to the website's public folder..." -ForegroundColor Cyan

# Create destination if it doesn't exist
if (-not (Test-Path -Path $destinationPath)) {
    New-Item -ItemType Directory -Force -Path $destinationPath | Out-Null
}

# Copy files recursively
Copy-Item -Path $sourcePath -Destination $destinationPath -Recurse -Force

Write-Host "Sync complete! The files are now available on the website." -ForegroundColor Green
