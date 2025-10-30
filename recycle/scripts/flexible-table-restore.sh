#!/bin/bash

# Flexible Single Table Restore Script
# Customize these variables for your specific databases

# Source database configuration
SOURCE_HOST="127.0.0.1"
SOURCE_PORT="6543"
SOURCE_USER="postgres.projectpro"
SOURCE_PASSWORD="7c9cc7162a66bf353e240e15016ff7b70e3e5d09397bf62bbde8c11f239e3f30"
SOURCE_DB="postgres"
TABLE_NAME="assets"  # Change this to any table you want to copy

# Destination database configuration
DEST_HOST="localhost"
DEST_PORT="5432"
DEST_USER="postgres"
DEST_PASSWORD="your_dest_password"  # Change this
DEST_DB="projectpro_backup"

echo "🚀 Starting single table copy: $TABLE_NAME"
echo "   From: $SOURCE_HOST:$SOURCE_PORT/$SOURCE_DB"
echo "   To:   $DEST_HOST:$DEST_PORT/$DEST_DB"
echo ""

# Create a timestamped backup file
BACKUP_FILE="${TABLE_NAME}_backup_$(date +%Y%m%d_%H%M%S).dump"

echo "📤 Step 1: Dumping $TABLE_NAME from source database..."
PGPASSWORD=$SOURCE_PASSWORD pg_dump -h $SOURCE_HOST -p $SOURCE_PORT -U $SOURCE_USER \
  -t $TABLE_NAME \
  -F c \
  -f $BACKUP_FILE \
  $SOURCE_DB

if [ $? -eq 0 ]; then
    echo "✅ Successfully dumped $TABLE_NAME to $BACKUP_FILE"
else
    echo "❌ Failed to dump table"
    exit 1
fi

echo ""
echo "📥 Step 2: Restoring $TABLE_NAME to destination database..."
PGPASSWORD=$DEST_PASSWORD pg_restore -h $DEST_HOST -p $DEST_PORT -U $DEST_USER \
  -d $DEST_DB \
  -t $TABLE_NAME \
  --no-owner \
  --no-privileges \
  --clean \
  $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Successfully restored $TABLE_NAME to destination database!"
    echo "   Rows copied: $(PGPASSWORD=$DEST_PASSWORD psql -h $DEST_HOST -p $DEST_PORT -U $DEST_USER -d $DEST_DB -t -c "SELECT COUNT(*) FROM $TABLE_NAME;")"
else
    echo "❌ Failed to restore table"
    exit 1
fi

echo ""
echo "🧹 Cleaning up temporary file..."
rm $BACKUP_FILE
echo "✅ Cleanup complete!"

echo ""
echo "🎉 Single table copy completed successfully!"
