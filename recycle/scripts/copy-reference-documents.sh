#!/bin/bash

# Copy Reference Documents Table from Supabase (6543) to Main PG (5555)
# This script copies the reference_documents table from the source database to the destination

echo "🔍 INVESTIGATION RESULTS:"
echo "   Source DB (6543): 31 columns, 723 rows"
echo "   Destination DB (5555): 27 columns, 723 rows"
echo "   Action: Copy from source to destination (more complete data)"
echo ""

# Source database configuration (Supabase pooler)
SOURCE_HOST="127.0.0.1"
SOURCE_PORT="6543"
SOURCE_USER="postgres.projectpro"
SOURCE_PASSWORD="7c9cc7162a66bf353e240e15016ff7b70e3e5d09397bf62bbde8c11f239e3f30"
SOURCE_DB="postgres"
TABLE_NAME="reference_documents"

# Destination database configuration (Main PG server)
DEST_HOST="127.0.0.1"
DEST_PORT="5555"
DEST_USER="postgres"
DEST_PASSWORD="password"
DEST_DB="projectpro"

echo "🚀 Starting reference documents table copy..."
echo "   From: $SOURCE_HOST:$SOURCE_PORT/$SOURCE_DB"
echo "   To:   $DEST_HOST:$DEST_PORT/$DEST_DB"
echo ""

# Create a timestamped backup file
BACKUP_FILE="reference_documents_copy_$(date +%Y%m%d_%H%M%S).dump"

echo "📤 Step 1: Creating custom dump from source database..."
PGPASSWORD=$SOURCE_PASSWORD pg_dump -h $SOURCE_HOST -p $SOURCE_PORT -U $SOURCE_USER \
  -t $TABLE_NAME \
  -F c \
  -f $BACKUP_FILE \
  $SOURCE_DB

if [ $? -eq 0 ]; then
    echo "✅ Successfully dumped reference_documents table"
else
    echo "❌ Failed to dump table"
    exit 1
fi

echo ""
echo "📥 Step 2: Restoring to destination database..."
# Use --clean to replace existing data
PGPASSWORD=$DEST_PASSWORD pg_restore -h $DEST_HOST -p $DEST_PORT -U $DEST_USER \
  -d $DEST_DB \
  -t $TABLE_NAME \
  --no-owner \
  --no-privileges \
  --clean \
  $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Successfully restored reference_documents table!"
    echo ""
    echo "📊 Verification:"
    PGPASSWORD=$DEST_PASSWORD psql -h $DEST_HOST -p $DEST_PORT -U $DEST_USER -d $DEST_DB -c "SELECT COUNT(*) FROM reference_documents;"
    echo ""
    echo "📝 Sample data:"
    PGPASSWORD=$DEST_PASSWORD psql -h $DEST_HOST -p $DEST_PORT -U $DEST_USER -d $DEST_DB -c "SELECT id, spec_id, spec_name, org_identifier FROM reference_documents LIMIT 3;"
else
    echo "❌ Failed to restore table"
    exit 1
fi

echo ""
echo "🧹 Cleaning up temporary file..."
rm $BACKUP_FILE
echo "✅ Cleanup complete!"

echo ""
echo "🎉 Reference documents table copy completed successfully!"
echo ""
echo "📋 Summary:"
echo "   • Source: Supabase pooler (6543) with 31 columns"
echo "   • Destination: Main PG server (5555) with 27 columns"
echo "   • Result: More complete data now in destination database"
echo "   • Records: $(PGPASSWORD=$DEST_PASSWORD psql -h $DEST_HOST -p $DEST_PORT -U $DEST_USER -d $DEST_DB -t -c "SELECT COUNT(*) FROM reference_documents;")"
