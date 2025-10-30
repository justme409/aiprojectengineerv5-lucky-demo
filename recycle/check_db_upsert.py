#!/usr/bin/env python3

import psycopg2
import json

def check_database_upsert():
    """Check if document extraction output has been upserted to database"""

    try:
        # Connect to database
        conn = psycopg2.connect(
            host="localhost",
            port=5555,
            database="projectpro",
            user="postgres",
            password="password"
        )

        cursor = conn.cursor()

        # Check assets table structure first
        print("=== Assets Table Structure ===")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'assets'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        for col in columns:
            print(f"{col[0]}: {col[1]} ({'NULL' if col[2] == 'YES' else 'NOT NULL'})")

        print("\n=== Assets for Project c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f ===")

        # Query assets for the project
        cursor.execute("""
            SELECT id, project_id, name, content, created_at, updated_at
            FROM assets
            WHERE project_id = 'c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f'
            ORDER BY created_at DESC;
        """)

        assets = cursor.fetchall()

        if not assets:
            print("❌ No assets found for this project")
            return False

        print(f"Found {len(assets)} assets:")

        for asset in assets:
            asset_id, project_id, name, content, created_at, updated_at = asset
            print(f"\n📄 Asset ID: {asset_id}")
            print(f"   Project ID: {project_id}")
            print(f"   Name: {name}")
            print(f"   Created: {created_at}")
            print(f"   Updated: {updated_at}")

            # Check if content is present
            if content:
                content_str = content if isinstance(content, str) else str(content)
                if len(content_str) > 200:
                    print(f"   Content: {content_str[:200]}... ({len(content_str)} chars)")
                else:
                    print(f"   Content: {content_str}")
            else:
                print("   Content: None ❌")
                return False

        print("\n✅ Database upsert verification completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    success = check_database_upsert()
    exit(0 if success else 1)
