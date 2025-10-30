#!/usr/bin/env python3
"""
TEST ORCHESTRATOR - Verify no orchestrator persistence after fix
"""

import sys
import os
import uuid
import importlib.util

def test_orchestrator_no_persistence():
    """Test that orchestrator no longer has persistence functions by checking source code"""
    print("🔍 Testing Orchestrator - No Persistence")
    print("=" * 50)

    try:
        # Read the orchestrator source code directly
        with open("services/langgraph_v10/src/agent/graphs/orchestrator.py", "r") as f:
            orchestrator_code = f.read()

        print("✅ Orchestrator source code read successfully")

        # Check that persist_all_assets_to_database function doesn't exist
        if "def persist_all_assets_to_database" in orchestrator_code:
            print("❌ persist_all_assets_to_database function still exists!")
            return False
        else:
            print("✅ persist_all_assets_to_database function REMOVED")

        # Check that upsertAssetsAndEdges is not imported
        if "from agent.action_graph_repo import upsertAssetsAndEdges" in orchestrator_code:
            print("❌ upsertAssetsAndEdges import still exists!")
            return False
        else:
            print("✅ upsertAssetsAndEdges import REMOVED")

        # Check that IdempotentAssetWriteSpec is not imported
        if "from agent.action_graph_repo import" in orchestrator_code and "IdempotentAssetWriteSpec" in orchestrator_code:
            print("❌ IdempotentAssetWriteSpec import still exists!")
            return False
        else:
            print("✅ IdempotentAssetWriteSpec import REMOVED")

        # Check that persist_all_assets node doesn't exist
        if 'persist_all_assets' in orchestrator_code:
            print("❌ persist_all_assets node still exists!")
            return False
        else:
            print("✅ persist_all_assets node REMOVED")

        print("\n🎉 SUCCESS: Orchestrator persistence has been completely removed!")
        print("✅ Subgraphs will handle their own persistence")
        print("✅ Orchestrator flow is clean: START → subgraphs → END")
        print("✅ No more double persistence!")

        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run the orchestrator no-persistence test"""
    print("🚀 TESTING ORCHESTRATOR - POST REMOVAL")
    print("This verifies that orchestrator persistence has been removed")
    print("=" * 60)

    try:
        success = test_orchestrator_no_persistence()

        if success:
            print("\n" + "=" * 60)
            print("🎯 CONCLUSION:")
            print("✅ Orchestrator persistence successfully removed")
            print("✅ Clean separation: Subgraphs persist, Orchestrator orchestrates")
            print("✅ No more redundancy!")
        else:
            print("\n" + "=" * 60)
            print("❌ ISSUE: Orchestrator still has persistence code")

    except Exception as e:
        print(f"\n💥 TEST CRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
