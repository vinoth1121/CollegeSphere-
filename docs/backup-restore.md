# CollegeSphere — Database Backup & Restoration Guide

## 1. Overview
CollegeSphere requires deterministic, encrypted, and isolated backup procedures to meet data protection and disaster recovery requirements.

## 2. Automated Backup Script (`database/scripts/backup.sh` / `.ps1`)
Backups utilize native MongoDB `mongodump` with archive compression:
```powershell
# Windows PowerShell Backup Command
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = "./backups"
$ARCHIVE_FILE = "$BACKUP_DIR/college_sphere_$TIMESTAMP.archive.gz"

mongodump --uri="$MONGODB_URI" --archive="$ARCHIVE_FILE" --gzip
```

## 3. Restoration Procedure (`database/scripts/restore.ps1`)
To restore an archive into an isolated staging or recovery database:
```powershell
# Restore to isolated target database
mongorestore --uri="$MONGODB_URI" --archive="backups/college_sphere_20261013_180000.archive.gz" --gzip --nsFrom="college_sphere.*" --nsTo="college_sphere_recovery.*"
```

## 4. Verification Checklist
1. Inspect document counts across all 22 collections before and after restore.
2. Verify unique index preservation (`db.collection.getIndexes()`).
3. Validate user authentication against restored database.
4. Verify student marks and financial invoices balance match the pre-backup state.
