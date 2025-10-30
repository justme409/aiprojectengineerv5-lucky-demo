#!/usr/bin/env python3
"""
TEST ORCHESTRATOR PERSISTENCE - Check if orchestrator calls persistence
"""

import sys
import os
import uuid
import importlib.util
from typing import Dict, List, Any
import psycopg2
from psycopg2.extras import Json

def test_orchestrator_persistence():
    """Test the orchestrator's persist_all_assets_to_database function"""
    print("🔍 Testing Orchestrator Persistence Function")
    print("=" * 50)

    # Import the orchestrator function directly
    spec = importlib.util.spec_from_file_location("orchestrator", "services/langgraph_v10/src/agent/graphs/orchestrator.py")
    orchestrator = importlib.util.module_from_spec(spec)

    # Mock the required imports to avoid package issues
    sys.modules['agent'] = type('MockAgent', (), {})()
    sys.modules['agent.graphs'] = type('MockGraphs', (), {})()
    sys.modules['agent.tools'] = type('MockTools', (), {})()
    sys.modules['agent.action_graph_repo'] = type('MockActionGraphRepo', (), {})()

    # Import action_graph_repo directly
    spec_repo = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
    action_graph_repo = importlib.util.module_from_spec(spec_repo)
    spec_repo.loader.exec_module(action_graph_repo)

    # Mock the imports in sys.modules
    sys.modules['agent.action_graph_repo'].upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
    sys.modules['agent.action_graph_repo'].IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

    try:
        spec.loader.exec_module(orchestrator)
        persist_all_assets_to_database = orchestrator.persist_all_assets_to_database
        print("✅ Successfully imported orchestrator persist function")
    except Exception as e:
        print(f"❌ Failed to import orchestrator persist function: {e}")
        return False

    # Create mock state with asset_specs
    project_id = str(uuid.uuid4())

    mock_state = type('MockState', (), {
        'project_id': project_id,
        'asset_specs': [
            {
                "asset": {
                    "type": "document",
                    "name": "Test Document 1",
                    "project_id": project_id,
                    "content": {"text": "test content"},
                    "metadata": {"category": "test"}
                },
                "idempotency_key": f"doc_extract:{project_id}:{str(uuid.uuid4())}",
                "edges": []
            },
            {
                "asset": {
                    "type": "plan",
                    "name": "Test Project Details",
                    "project_id": project_id,
                    "content": {"project_name": "Test Project"},
                    "metadata": {"plan_type": "project_details"}
                },
                "idempotency_key": f"project_details:{project_id}",
                "edges": []
            }
        ]
    })()

    print(f"📦 Created mock state with {len(mock_state.asset_specs)} asset specs")

    # Test the persistence function
    print("💾 Testing orchestrator persistence function...")
    try:
        result = persist_all_assets_to_database(mock_state)
        print(f"✅ Persistence function returned: {result}")

        if result.get('success'):
            print("🎉 Orchestrator persistence function works!")

            # Check if assets were actually created
            verify_orchestrator_persistence(project_id, len(mock_state.asset_specs))

        else:
            print(f"❌ Persistence function failed: {result.get('error', 'Unknown error')}")

    except Exception as e:
        print(f"❌ Persistence function crashed: {e}")
        import traceback
        traceback.print_exc()

def verify_orchestrator_persistence(project_id: str, expected_count: int):
    """Verify that assets were persisted by the orchestrator"""
    print(f"🔍 Verifying {expected_count} assets persisted by orchestrator...")

    try:
        # Import database functions
        spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(action_graph_repo)
        get_database_url = action_graph_repo.get_database_url

        conn = psycopg2.connect(get_database_url())
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*) FROM public.assets
            WHERE project_id = %s AND is_current = true
        """, (project_id,))

        count = cursor.fetchone()[0]

        if count == expected_count:
            print(f"✅ Found {count} assets in database - orchestrator persistence working!")

            # Show the assets
            cursor.execute("""
                SELECT type, name FROM public.assets
                WHERE project_id = %s AND is_current = true
                ORDER BY created_at DESC
            """, (project_id,))

            assets = cursor.fetchall()
            for asset in assets:
                print(f"   - {asset[1]} ({asset[0]})")

        else:
            print(f"❌ Expected {expected_count} assets, found {count}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Database verification failed: {e}")

def cleanup_orchestrator_test(project_id: str):
    """Clean up test data"""
    try:
        spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(action_graph_repo)
        get_database_url = action_graph_repo.get_database_url

        conn = psycopg2.connect(get_database_url())
        cursor = conn.cursor()

        # Delete test data
        cursor.execute("DELETE FROM public.asset_edges WHERE from_asset_id IN (SELECT id FROM public.assets WHERE project_id = %s)", (project_id,))
        cursor.execute("DELETE FROM public.assets WHERE project_id = %s", (project_id,))
        cursor.execute("DELETE FROM public.projects WHERE id = %s", (project_id,))
        cursor.execute("DELETE FROM public.organizations WHERE id IN (SELECT organization_id FROM public.projects WHERE id = %s)", (project_id,))

        conn.commit()
        cursor.close()
        conn.close()

        print("🧹 Test data cleanup completed")

    except Exception as e:
        print(f"⚠️ Cleanup failed: {e}")

def main():
    """Run the orchestrator persistence test"""
    print("🚀 TESTING ORCHESTRATOR PERSISTENCE FUNCTION")
    print("This tests if the orchestrator's persist_all_assets_to_database works")
    print("=" * 60)

    try:
        test_orchestrator_persistence()

        print("\n" + "=" * 60)
        print("🎯 CONCLUSION:")
        print("If you see 'orchestrator persistence working' then the orchestrator")
        print("persistence function is correctly calling upsertAssetsAndEdges")
        print("If not, the issue is in the orchestrator's final persistence step")

    except Exception as e:
        print(f"\n💥 TEST CRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
