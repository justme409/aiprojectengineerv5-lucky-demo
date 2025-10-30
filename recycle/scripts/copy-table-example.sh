#!/bin/bash

# Method 1: Using pg_dump (Recommended)
# Copy table 'assets' from source DB to destination DB

# For your local setup:
pg_dump -h 127.0.0.1 -p 6543 -U postgres.projectpro -t assets -d postgres > assets_dump.sql

# Restore to another database:
# psql -h DEST_HOST -p DEST_PORT -U DEST_USER -d DEST_DB < assets_dump.sql

# Method 2: Direct SQL copy (if databases are accessible)
# psql -h SOURCE_HOST -p SOURCE_PORT -U SOURCE_USER -d SOURCE_DB \
#   -c "COPY (SELECT * FROM assets) TO STDOUT WITH CSV" | \
#   psql -h DEST_HOST -p DEST_PORT -U DEST_USER -d DEST_DB \
#   -c "COPY assets FROM STDIN WITH CSV"
