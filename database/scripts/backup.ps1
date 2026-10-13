# CollegeSphere Automated Database Backup Script
param(
    [string]$Uri = $env:MONGODB_URI,
    [string]$OutputDir = "./backups"
)

if (-not $Uri) {
    Write-Error "MONGODB_URI environment variable or -Uri parameter is required."
    exit 1
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ArchiveFile = "$OutputDir/college_sphere_$Timestamp.archive.gz"

Write-Host "Starting backup of CollegeSphere database..." -ForegroundColor Cyan
Write-Host "Archive Destination: $ArchiveFile"

mongodump --uri="$Uri" --archive="$ArchiveFile" --gzip

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup completed successfully: $ArchiveFile" -ForegroundColor Green
} else {
    Write-Error "❌ Backup failed with exit code $LASTEXITCODE"
}
