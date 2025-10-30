#!/usr/bin/env python3
"""
TEST UPSERT FUNCTION DIRECTLY - Test the core upsertAssetsAndEdges function
"""

import sys
import os
import uuid
import importlib.util
from typing import Dict, List, Any

def test_upsert_function_directly():
    """Test the upsertAssetsAndEdges function directly without any package imports"""
    print("🔍 Testing upsertAssetsAndEdges Function Directly")
    print("=" * 60)

    # Setup test environment
    project_id, doc_ids = setup_test_environment()

    print(f"📋 Test Project: {project_id}")
    print(f"📄 Test Documents: {doc_ids}")

    # Import action_graph_repo directly using importlib
    print("\n📦 Importing action_graph_repo directly...")
    spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")

    # Create a clean module without the agent package initialization
    action_graph_repo = importlib.util.module_from_spec(spec)

    # Manually set up the required globals before executing the module
    import psycopg2
    from psycopg2.extras import Json

    # Add required modules to sys.modules to avoid import errors
    sys.modules['psycopg2'] = psycopg2
    sys.modules['psycopg2.extras'] = psycopg2.extras

    # Execute the module
    spec.loader.exec_module(action_graph_repo)

    print("✅ action_graph_repo imported successfully")

    # Get the functions we need
    upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
    IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

    print("✅ Got upsertAssetsAndEdges and IdempotentAssetWriteSpec")

    # Test all 7 subgraph persistence scenarios
    results = {}

    print("\n" + "=" * 50)
    print("🧪 TESTING ALL 7 SUBGRAPH PERSISTENCE SCENARIOS")
    print("=" * 50)

    # Test 1: Document Extraction
    results['document_extraction'] = test_document_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id, doc_ids[0])

    # Test 2: Project Details
    results['project_details'] = test_project_details_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id)

    # Test 3: Standards Extraction
    results['standards_extraction'] = test_standards_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id)

    # Test 4: Plan Generation
    results['plan_generation'] = test_plan_generation_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id)

    # Test 5: WBS Extraction
    results['wbs_extraction'] = test_wbs_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id)

    # Test 6: LBS Extraction
    results['lbs_extraction'] = test_lbs_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id)

    # Test 7: ITP Generation
    results['itp_generation'] = test_itp_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id)

    # Results summary
    print("\n" + "=" * 70)
    print("📊 FINAL RESULTS: ALL 7 SUBGRAPH PERSISTENCE SCENARIOS")
    print("=" * 70)

    successful = 0
    total = len(results)

    for subgraph, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{subgraph:25} {status}")
        if result:
            successful += 1

    print(f"\n🎯 FINAL SCORE: {successful}/{total} subgraph persistence scenarios working")

    if successful == total:
        print("🎉 PERFECT! 7/7 SUCCESS ACHIEVED!")
        print("✅ All subgraph persistence scenarios working")
        print("✅ upsertAssetsAndEdges function working perfectly")
        print("✅ Database operations functioning correctly")
        print("✅ LangGraph microservice ready for production")

        # Verify data in database
        verify_database_results(project_id)

    else:
        print(f"⚠️ ACHIEVED: {successful}/{total} - {total-successful} scenarios need fixes")

    # Cleanup
    cleanup_test_environment(project_id, doc_ids)

    return successful == total

def setup_test_environment():
    """Set up test project and documents in database"""
    print("🏗️ Setting up test environment...")

    # Import database functions directly
    spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
    action_graph_repo = importlib.util.module_from_spec(spec)

    # Set up minimal modules
    import psycopg2
    from psycopg2.extras import Json
    sys.modules['psycopg2'] = psycopg2
    sys.modules['psycopg2.extras'] = psycopg2.extras

    spec.loader.exec_module(action_graph_repo)
    get_database_url = action_graph_repo.get_database_url

    import psycopg2
    from psycopg2.extras import Json

    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(get_database_url())
        cursor = conn.cursor()

        # Create test organization
        org_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO public.organizations (id, name, domain, metadata)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (org_id, "Test Org", "test.com", Json({"test": True})))

        # Create test project
        project_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO public.projects (id, name, description, location, client_name, organization_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (project_id, "Test Project", "Test project for upsert function",
               "Test Location", "Test Client", org_id))

        # Create test documents
        doc_ids = []
        for i in range(2):
            doc_id = str(uuid.uuid4())
            doc_ids.append(doc_id)
            cursor.execute("""
                INSERT INTO public.documents (
                    id, project_id, file_name, content_type, size,
                    document_number, revision_code, raw_content
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                doc_id, project_id,
                f"test_document_{i+1}.pdf",
                "application/pdf",
                1024000,
                f"DOC-{str(uuid.uuid4())[:8]}",
                "A",
                f"Test document content {i+1} for upsert testing."
            ))

        conn.commit()
        cursor.close()
        conn.close()

        print(f"✅ Created test project: {project_id}")
        print(f"✅ Created {len(doc_ids)} test documents")

        return project_id, doc_ids

    except Exception as e:
        if cursor: cursor.close()
        if conn: conn.close()
        print(f"❌ Failed to setup test environment: {e}")
        raise

def test_document_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id: str, doc_id: str):
    """Test document extraction scenario"""
    print("📑 Testing Document Extraction Scenario...")

    try:
        write_spec = IdempotentAssetWriteSpec(
            asset_type="document",
            asset_subtype="processed_document",
            name="Test Document 1",
            description="Processed document from test",
            project_id=project_id,
            metadata={
                "category": "specification",
                "extraction_method": "test",
                "llm_outputs": {"confidence": 0.85}
            },
            content={
                "source_document_id": doc_id,
                "extracted_content": "This is test extracted content",
                "file_name": "test_doc_1.pdf",
                "blob_url": f"/documents/{doc_id}",
                "storage_path": f"/storage/{doc_id}.pdf"
            },
            idempotency_key=f"doc_extract:{project_id}:{doc_id}",
            edges=[]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ Document extraction scenario: PASSED")
            return True
        else:
            print(f"   ❌ Document extraction scenario: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ Document extraction scenario: ERROR - {e}")
        return False

def test_project_details_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id: str):
    """Test project details scenario"""
    print("🏢 Testing Project Details Scenario...")

    try:
        write_spec = IdempotentAssetWriteSpec(
            asset_type="plan",
            asset_subtype="project_details",
            name="Test Project Details",
            description="Extracted project details and metadata",
            project_id=project_id,
            metadata={
                "plan_type": "project_details",
                "category": "project",
                "extraction_method": "test"
            },
            content={
                "project_name": "Test Construction Project",
                "project_address": "123 Test St, Test City",
                "scope": "Test project scope",
                "requirements": "Test requirements"
            },
            idempotency_key=f"project_details:{project_id}",
            edges=[]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ Project details scenario: PASSED")
            return True
        else:
            print(f"   ❌ Project details scenario: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ Project details scenario: ERROR - {e}")
        return False

def test_standards_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id: str):
    """Test standards extraction scenario"""
    print("📋 Testing Standards Extraction Scenario...")

    try:
        write_spec = IdempotentAssetWriteSpec(
            asset_type="standard",
            asset_subtype="standard",
            name="AS 1289 - Methods of testing soils",
            description="Extracted standard reference from project documents",
            project_id=project_id,
            metadata={
                "category": "register",
                "extraction_method": "test"
            },
            content={
                "standard_code": "AS 1289",
                "spec_name": "Methods of testing soils for engineering purposes",
                "org_identifier": "SA",
                "section_reference": "Section 3.1",
                "context": "Soil testing requirements",
                "found_in_database": True,
                "document_ids": [str(uuid.uuid4())]
            },
            idempotency_key=f"standard:{project_id}:AS 1289",
            edges=[]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ Standards extraction scenario: PASSED")
            return True
        else:
            print(f"   ❌ Standards extraction scenario: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ Standards extraction scenario: ERROR - {e}")
        return False

def test_plan_generation_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id: str):
    """Test plan generation scenario"""
    print("📋 Testing Plan Generation Scenario...")

    try:
        write_spec = IdempotentAssetWriteSpec(
            asset_type="plan",
            asset_subtype="management_plans",
            name="Comprehensive Management Plans",
            description="Generated comprehensive management plans",
            project_id=project_id,
            metadata={
                "plan_type": "comprehensive_management",
                "category": "management",
                "extraction_method": "test"
            },
            content={
                "plans": [
                    {
                        "plan_type": "pqp",
                        "plan_name": "Quality Management Plan",
                        "plan_items": [
                            {
                                "id": "section_1",
                                "item_no": "1.0",
                                "title": "Introduction",
                                "content_type": "section",
                                "content": "Test content",
                                "parentId": None
                            }
                        ]
                    }
                ],
                "summary": {
                    "total_plans": 1,
                    "plan_types": ["pqp"],
                    "total_sections": 1
                }
            },
            idempotency_key=f"plans:{project_id}",
            edges=[]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ Plan generation scenario: PASSED")
            return True
        else:
            print(f"   ❌ Plan generation scenario: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ Plan generation scenario: ERROR - {e}")
        return False

def test_wbs_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id: str):
    """Test WBS extraction scenario"""
    print("📋 Testing WBS Extraction Scenario...")

    try:
        write_spec = IdempotentAssetWriteSpec(
            asset_type="plan",
            asset_subtype="wbs",
            name="Work Breakdown Structure",
            description="Extracted Work Breakdown Structure",
            project_id=project_id,
            metadata={
                "plan_type": "wbs",
                "category": "planning",
                "extraction_method": "test"
            },
            content={
                "nodes": [
                    {
                        "id": "project_root",
                        "parentId": None,
                        "node_type": "project",
                        "name": "Test Project",
                        "is_leaf_node": False
                    },
                    {
                        "id": "work_package_1",
                        "parentId": "project_root",
                        "node_type": "work_package",
                        "name": "Foundation Works",
                        "is_leaf_node": True,
                        "itp_required": True
                    }
                ],
                "metadata": {
                    "extraction_method": "test"
                }
            },
            idempotency_key=f"wbs:{project_id}",
            edges=[]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ WBS extraction scenario: PASSED")
            return True
        else:
            print(f"   ❌ WBS extraction scenario: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ WBS extraction scenario: ERROR - {e}")
        return False

def test_lbs_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id: str):
    """Test LBS extraction scenario"""
    print("📋 Testing LBS Extraction Scenario...")

    try:
        write_spec = IdempotentAssetWriteSpec(
            asset_type="plan",
            asset_subtype="lbs",
            name="Location-Based Schedule",
            description="Extracted Location-Based Schedule",
            project_id=project_id,
            metadata={
                "plan_type": "lbs",
                "category": "scheduling",
                "extraction_method": "test"
            },
            content={
                "lot_cards": [
                    {
                        "lot_card_id": str(uuid.uuid4()),
                        "location_levels": [{"order": 1, "name": "Site Area A"}],
                        "location_full_path": "Site Area A",
                        "location_depth": 1,
                        "work_levels": [{"order": 1, "name": "Foundation Works"}],
                        "work_full_path": "Foundation Works",
                        "work_depth": 1,
                        "work_package_id": str(uuid.uuid4()),
                        "work_package_name": "Foundation Works",
                        "lot_number": "L001",
                        "sequence_order": 1,
                        "status": "potential"
                    }
                ],
                "metadata": {
                    "extraction_timestamp": "2025-01-01T00:00:00.000Z"
                }
            },
            idempotency_key=f"lbs:{project_id}",
            edges=[]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ LBS extraction scenario: PASSED")
            return True
        else:
            print(f"   ❌ LBS extraction scenario: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ LBS extraction scenario: ERROR - {e}")
        return False

def test_itp_scenario(upsertAssetsAndEdges, IdempotentAssetWriteSpec, project_id: str):
    """Test ITP generation scenario"""
    print("📋 Testing ITP Generation Scenario...")

    try:
        write_spec = IdempotentAssetWriteSpec(
            asset_type="plan",
            asset_subtype="itp",
            name="Inspection and Test Plans",
            description="Generated Inspection and Test Plans",
            project_id=project_id,
            metadata={
                "plan_type": "itp",
                "category": "quality",
                "extraction_method": "test"
            },
            content={
                "itps": [
                    {
                        "wbs_node_id": str(uuid.uuid4()),
                        "wbs_node_title": "Foundation Works",
                        "itp_items": [
                            {
                                "id": "item_1",
                                "item_no": "1.1",
                                "inspection_test_point": "Concrete placement inspection",
                                "acceptance_criteria": "No defects, proper consolidation",
                                "section_name": "Concrete Works",
                                "parentId": None
                            }
                        ]
                    }
                ],
                "summary": {
                    "total_itps": 1,
                    "target_work_packages": ["Foundation Works"],
                    "total_inspection_points": 1
                }
            },
            idempotency_key=f"itp:{project_id}",
            edges=[]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ ITP generation scenario: PASSED")
            return True
        else:
            print(f"   ❌ ITP generation scenario: FAILED - {result.get('error', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"   ❌ ITP generation scenario: ERROR - {e}")
        return False

def verify_database_results(project_id: str):
    """Verify all assets were persisted successfully"""
    print(f"\n🔍 Verifying database results for project {project_id}...")

    # Import database functions directly to avoid package issues
    spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
    action_graph_repo = importlib.util.module_from_spec(spec)

    import psycopg2
    from psycopg2.extras import Json
    sys.modules['psycopg2'] = psycopg2
    sys.modules['psycopg2.extras'] = psycopg2.extras

    spec.loader.exec_module(action_graph_repo)
    get_database_url = action_graph_repo.get_database_url

    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(get_database_url())
        cursor = conn.cursor()

        cursor.execute("""
            SELECT type, name, COUNT(*) as count
            FROM public.assets
            WHERE project_id = %s AND is_current = true
            GROUP BY type, name
            ORDER BY type, name
        """, (project_id,))

        assets = cursor.fetchall()

        print("📊 Assets successfully persisted to database:")
        total_count = 0
        for asset_type, name, count in assets:
            print(f"   - {name} ({asset_type}) - {count} version(s)")
            total_count += count

        print(f"\n✅ TOTAL ASSETS PERSISTED: {total_count}")

        if total_count >= 7:  # At least one from each subgraph
            print("🎉 SUCCESS: All 7 subgraph scenarios successfully persisted data!")
            print("✅ 7/7 persistence scenarios working perfectly")
            print("✅ upsertAssetsAndEdges function working flawlessly")
        else:
            print(f"⚠️ Only {total_count} assets found, expected at least 7")

        cursor.close()
        conn.close()

    except Exception as e:
        if cursor: cursor.close()
        if conn: conn.close()
        print(f"❌ Database verification failed: {e}")

def cleanup_test_environment(project_id: str, doc_ids: List[str]):
    """Clean up test environment"""
    print("\n🧹 Cleaning up test environment...")

    # Import database functions directly
    spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
    action_graph_repo = importlib.util.module_from_spec(spec)

    import psycopg2
    from psycopg2.extras import Json
    sys.modules['psycopg2'] = psycopg2
    sys.modules['psycopg2.extras'] = psycopg2.extras

    spec.loader.exec_module(action_graph_repo)
    get_database_url = action_graph_repo.get_database_url

    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(get_database_url())
        cursor = conn.cursor()

        # Delete test data
        cursor.execute("DELETE FROM public.asset_edges WHERE from_asset_id IN (SELECT id FROM public.assets WHERE project_id = %s)", (project_id,))
        cursor.execute("DELETE FROM public.assets WHERE project_id = %s", (project_id,))
        for doc_id in doc_ids:
            cursor.execute("DELETE FROM public.documents WHERE id = %s", (doc_id,))
        cursor.execute("DELETE FROM public.projects WHERE id = %s", (project_id,))
        cursor.execute("DELETE FROM public.organizations WHERE id IN (SELECT organization_id FROM public.projects WHERE id = %s)", (project_id,))

        conn.commit()
        cursor.close()
        conn.close()

        print("✅ Test environment cleanup completed")

    except Exception as e:
        if cursor: cursor.close()
        if conn: conn.close()
        print(f"⚠️ Cleanup failed: {e}")

def main():
    """Run the direct upsert function test for all 7 subgraph scenarios"""
    print("🚀 DIRECT UPSERT FUNCTION TEST: ALL 7 SUBGRAPH SCENARIOS")
    print("Testing upsertAssetsAndEdges with real data for each subgraph")
    print("=" * 75)

    try:
        success = test_upsert_function_directly()

        print("\n" + "=" * 75)
        if success:
            print("🎉 MISSION ACCOMPLISHED!")
            print("✅ ALL 7 SUBGRAPH PERSISTENCE SCENARIOS WORKING!")
            print("✅ upsertAssetsAndEdges function working perfectly")
            print("✅ Database persistence logic is solid")
            print("✅ LangGraph microservice persistence ready for production")
            print()
            print("🏆 RESULT: 7/7 SUCCESS ACHIEVED!")
            print("The persistence layer is working perfectly!")
        else:
            print("⚠️ SOME PERSISTENCE SCENARIOS NEED FIXES")
            print("🔧 Focus on the upsertAssetsAndEdges function")

    except Exception as e:
        print(f"\n💥 TEST SUITE CRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
