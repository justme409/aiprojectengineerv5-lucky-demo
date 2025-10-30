#!/usr/bin/env python3
"""
DEBUG UPSERT FUNCTION - Simple test to check database connection
"""

import sys
import uuid
import importlib.util

def debug_upsert():
    """Simple debug test"""
    print("🐛 DEBUG: Testing basic database connection...")

    try:
        # Import action_graph_repo directly
        spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec)

        # Set up minimal modules
        import psycopg2
        from psycopg2.extras import Json
        sys.modules['psycopg2'] = psycopg2
        sys.modules['psycopg2.extras'] = psycopg2.extras

        spec.loader.exec_module(action_graph_repo)

        print("✅ action_graph_repo imported successfully")

        # Get database URL
        get_database_url = action_graph_repo.get_database_url
        db_url = get_database_url()
        print(f"✅ Database URL obtained: {db_url[:50]}...")

        # Test database connection
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()

        # Simple test query
        cursor.execute("SELECT COUNT(*) FROM public.assets")
        count = cursor.fetchone()[0]
        print(f"✅ Database connection successful. Assets count: {count}")

        cursor.close()
        conn.close()

        print("✅ DEBUG COMPLETE: Database connection working")

    except Exception as e:
        print(f"❌ DEBUG ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_upsert()
