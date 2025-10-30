#!/usr/bin/env python3

import psycopg2
from datetime import datetime

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
cursor.execute("SELECT type, COUNT(*) as count FROM public.assets GROUP BY type ORDER BY count DESC;")
asset_types = cursor.fetchall()
print("\n📋 ASSETS BY TYPE:")
for asset_type, count in asset_types:
    print(f"   • {asset_type}: {count}")

# Check for plans specifically
cursor.execute("SELECT id, name, subtype, created_at FROM public.assets WHERE type = 'plan' ORDER BY created_at DESC;")
plans = cursor.fetchall()
print(f"\n📋 ALL PLANS ({len(plans)} found):")
for i, plan in enumerate(plans, 1):
    plan_id, name, subtype, created_at = plan
    print(f"   {i}. [{created_at.strftime('%H:%M:%S')}] {name}")
    print(f"      └─ Subtype: {subtype}")
    print(f"      └─ ID: {plan_id}")

# Check specific project
project_id = "c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f"
cursor.execute("SELECT COUNT(*) FROM public.assets WHERE project_id = %s;", (project_id,))
project_count = cursor.fetchone()[0]
print(f"\n🏗️  PROJECT {project_id[:8]}...: {project_count} assets")

cursor.close()
conn.close()

