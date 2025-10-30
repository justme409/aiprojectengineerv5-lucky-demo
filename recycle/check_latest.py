#!/usr/bin/env python3
"""
Latest Database Check - What changed since last check?
"""

import psycopg2
import sys
from datetime import datetime

def check_latest_assets():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5555",
            database="projectpro",
            user="postgres",
            password="password"
        )

        cursor = conn.cursor()

        print("🔍 LATEST DATABASE CHECK")
        print("=" * 60)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        # Check total counts
        cursor.execute("SELECT COUNT(*) FROM public.assets;")
        total_assets = cursor.fetchone()[0]
        print(f"📊 TOTAL ASSETS: {total_assets}")

        # Check assets by type
        cursor.execute("""
            SELECT type, COUNT(*) as count
            FROM public.assets
            GROUP BY type
            ORDER BY count DESC;
        """)
        asset_types = cursor.fetchall()
        print("\n📋 ASSETS BY TYPE:")
        for asset_type, count in asset_types:
            print(f"   • {asset_type}: {count}")

        # Check for the most recent assets (last 10 minutes)
        print("\n🆕 MOST RECENT ASSETS (LAST 10 MINUTES):")        cursor.execute("""
            SELECT id, type, subtype, name, project_id, status, created_at
            FROM public.assets
            WHERE created_at > NOW() - INTERVAL '10 minutes'
            ORDER BY created_at DESC;
        """)
        recent_assets = cursor.fetchall()

        if recent_assets:
            print(f"Found {len(recent_assets)} new assets in the last 10 minutes:")
            for i, asset in enumerate(recent_assets, 1):
                asset_id, asset_type, subtype, name, project_id, status, created_at = asset
                print(f"   {i}. [{created_at.strftime('%H:%M:%S')}] {asset_type}/{subtype}")
                print(f"      └─ Name: {name}")
                print(f"      └─ ID: {asset_id}")
                if project_id:
                    print(f"      └─ Project: {project_id}")
        else:
            print("No assets added in the last 10 minutes")

        # Check for assets created in the last hour
        print("\n📅 ASSETS FROM LAST HOUR:")        cursor.execute("""
            SELECT COUNT(*), type
            FROM public.assets
            WHERE created_at > NOW() - INTERVAL '1 hour'
            GROUP BY type
            ORDER BY count DESC;
        """)
        hourly_assets = cursor.fetchall()

        if hourly_assets:
            print(f"Assets created in the last hour:")
            for count, asset_type in hourly_assets:
                print(f"   • {asset_type}: {count}")
        else:
            print("No assets in the last hour")

        # Check specific project we were looking at
        project_id = "c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f"
        cursor.execute("""
            SELECT COUNT(*)
            FROM public.assets
            WHERE project_id = %s;
        """, (project_id,))
        project_asset_count = cursor.fetchone()[0]
        print(f"\n🏗️  PROJECT {project_id[:8]}...: {project_asset_count} assets")

        # Check asset edges/relationships
        try:
            cursor.execute("SELECT COUNT(*) FROM public.asset_edges;")
            edge_count = cursor.fetchone()[0]
            print(f"\n🔗 ASSET RELATIONSHIPS: {edge_count} edges")

            if edge_count > 0:
                cursor.execute("""
                    SELECT edge_type, COUNT(*)
                    FROM public.asset_edges
                    GROUP BY edge_type
                    ORDER BY count DESC
                    LIMIT 5;
                """)
                edge_types = cursor.fetchall()
                print("   Edge types:")
                for edge_type, count in edge_types:
                    print(f"   • {edge_type}: {count}")
        except Exception as e:
            print(f"   ⚠️ Asset edges table issue: {e}")

        # Check for processing runs
        try:
            cursor.execute("SELECT COUNT(*) FROM public.processing_runs;")
            run_count = cursor.fetchone()[0]
            print(f"\n⚙️  PROCESSING RUNS: {run_count}")

            if run_count > 0:
                cursor.execute("""
                    SELECT agent_id, model, status, created_at
                    FROM public.processing_runs
                    ORDER BY created_at DESC
                    LIMIT 3;
                """)
                runs = cursor.fetchall()
                for run in runs:
                    agent, model, status, created_at = run
                    print(f"   • {agent} ({status}) - {created_at.strftime('%H:%M:%S')}")
        except Exception as e:
            print(f"   ⚠️ Processing runs table issue: {e}")

        # Check for any new asset types we haven't seen before
        cursor.execute("""
            SELECT DISTINCT type, subtype
            FROM public.assets
            ORDER BY type, subtype;
        """)
        all_types = cursor.fetchall()
        print("\n📂 ALL ASSET TYPES/SUBTYPES:")        current_type = None
        for asset_type, subtype in all_types:
            if asset_type != current_type:
                print(f"   • {asset_type}:")
                current_type = asset_type
            if subtype:
                print(f"     └─ {subtype}")

        cursor.close()
        conn.close()

        print("\n🎯 SUMMARY")        print("=" * 60)
        print(f"✅ Database accessible: {total_assets} total assets")
        print(f"✅ Connection successful at {datetime.now().strftime('%H:%M:%S')}")

    except Exception as e:
        print(f"❌ Database connection or query error: {e}")
        print("💡 Make sure the database is running on localhost:5555")
        sys.exit(1)

if __name__ == "__main__":
    check_latest_assets()
