#!/bin/bash
set -euo pipefail

# ============================================
# Smart Hospital - PostgreSQL Backup Script
# Run daily via cron or Docker service
# ============================================

BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="smart_hospital_${TIMESTAMP}.sql.gz"

DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-hospital_admin}"
DB_NAME="${DB_NAME:-smart_hospital}"

echo "🔄 Starting backup: ${FILENAME}"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-owner \
  --no-privileges \
  --format=custom \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

# Verify backup was created
if [ -f "${BACKUP_DIR}/${FILENAME}" ]; then
  SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
  echo "✅ Backup created: ${FILENAME} (${SIZE})"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Retention: keep only last 30 backups
DELETED=$(ls -tp "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | tail -n +31 | wc -l)
ls -tp "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | tail -n +31 | xargs -I {} rm -- {} 2>/dev/null || true
echo "🗑️  Cleaned up ${DELETED} old backups (keeping last 30)"

echo "✅ Backup complete"
