# CollegeSphere Database Restoration & Verification Script
param(
    [Parameter(Mandatory=$true)]
    [string]$ArchiveFile,
    [string]$TargetUri = $env:MONGODB_URI,
    [string]$FromDb = "college_sphere",
    [string]$ToDb = "college_sphere_restored"
)

if (-not (Test-Path $ArchiveFile)) {
    Write-Error "Archive file not found: $ArchiveFile"
    exit 1
}

Write-Host "Restoring database archive to isolated destination ($ToDb)..." -ForegroundColor Cyan
mongorestore --uri="$TargetUri" --archive="$ArchiveFile" --gzip --nsFrom="$FromDb.*" --nsTo="$ToDb.*" --drop

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database restore to '$ToDb' completed successfully!" -ForegroundColor Green
} else {
    Write-Error "❌ Restore failed with exit code $LASTEXITCODE"
}
