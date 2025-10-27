#!/bin/sh

# Database backup script for production
set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ielts_backup_${DATE}.sql"
FULL_BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Database connection details
DB_HOST="postgres"
DB_NAME="${POSTGRES_DB:-ielts_mock_test}"
DB_USER="${POSTGRES_USER:-ielts_user}"

echo "Starting database backup at $(date)"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform the backup
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" \
    --verbose \
    --no-password \
    --format=custom \
    --compress=9 \
    --file="${FULL_BACKUP_PATH}"

# Verify backup was created and has content
if [ -f "${FULL_BACKUP_PATH}" ] && [ -s "${FULL_BACKUP_PATH}" ]; then
    echo "Backup completed successfully: ${BACKUP_FILE}"
    echo "Backup size: $(du -h "${FULL_BACKUP_PATH}" | cut -f1)"
    
    # Keep only last 7 days of backups
    find "${BACKUP_DIR}" -name "ielts_backup_*.sql" -type f -mtime +7 -delete
    echo "Cleaned up old backups (older than 7 days)"
else
    echo "ERROR: Backup failed or file is empty"
    exit 1
fi

echo "Backup process completed at $(date)"
