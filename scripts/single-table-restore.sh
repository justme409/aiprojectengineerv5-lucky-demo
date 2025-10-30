#!/bin/bash

# Single Table Restore to Existing Schema
# This is perfect for your use case!

# Step 1: Dump specific table from source database
echo "📤 Dumping assets table from source database..."
pg_dump -h 127.0.0.1 -p 6543 -U postgres.projectpro \
  -t assets \
  -F c \
  -f assets_backup.dump \
  postgres

echo "✅ Table dumped to assets_backup.dump"

# Step 2: Restore to destination database
echo "📥 Restoring assets table to destination database..."
pg_restore -h localhost -p 5432 -U postgres \
  -d projectpro_backup \
  -t assets \
  --no-owner \
  --no-privileges \
  assets_backup.dump

echo "✅ Table restored to destination database!"

# Clean up
rm assets_backup.dump
