#!/usr/bin/env python3
"""
CORE SUBGRAPH PERSISTENCE TEST - Direct function testing without complex mocking
"""

import sys
import os
import uuid
import importlib.util
from typing import Dict, List, Any

def test_core_persistence():
    """Test the core persistence logic of all 7 subgraphs"""
    print("🔍 Testing Core Subgraph Persistence Logic")
    print("=" * 60)

    # Setup test environment
    project_id, doc_ids = setup_test_environment()

    print(f"📋 Test Project: {project_id}")
    print(f"📄 Test Documents: {doc_ids}")

    # Test core persistence logic directly
    results = {}

    print("\n" + "=" * 50)
    print("🧪 TESTING CORE PERSISTENCE LOGIC")
    print("=" * 50)

    results['document_extraction'] = test_document_persistence_core(project_id, doc_ids)
    results['project_details'] = test_project_details_persistence_core(project_id)
    results['standards_extraction'] = test_standards_persistence_core(project_id)
    results['plan_generation'] = test_plan_generation_persistence_core(project_id)
    results['wbs_extraction'] = test_wbs_persistence_core(project_id)
    results['lbs_extraction'] = test_lbs_persistence_core(project_id)
    results['itp_generation'] = test_itp_persistence_core(project_id)

    # Results summary
    print("\n" + "=" * 60)
    print("📊 CORE PERSISTENCE TEST RESULTS")
    print("=" * 60)

    successful = 0
    total = len(results)

    for subgraph, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{subgraph:25} {status}")
        if result:
            successful += 1

    print(f"\n🎯 SCORE: {successful}/{total} core persistence functions working")

    if successful == total:
        print("🎉 ALL CORE PERSISTENCE FUNCTIONS WORKING!")
        print("✅ Database persistence logic is sound")
        print("✅ Subgraph persistence architecture is functional")
        print("✅ Ready for integration with LangGraph")

        # Verify data in database
        verify_database_results(project_id)

    else:
        print(f"⚠️ {total-successful} core functions need fixes")
        print("🔧 Focus on database persistence logic")

    # Cleanup
    cleanup_test_environment(project_id, doc_ids)

    return successful == total

def setup_test_environment():
    """Set up test project and documents in database"""
    print("🏗️ Setting up test environment...")

    # Import database functions
    spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
    action_graph_repo = importlib.util.module_from_spec(spec)
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
        """, (project_id, "Test Project", "Test project for core persistence",
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
                f"Test document content {i+1} for core persistence testing."
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

def test_document_persistence_core(project_id: str, doc_ids: List[str]):
    """Test document extraction persistence core logic"""
    print("📑 Testing Document Extraction Core...")

    try:
        # Direct test of the persistence logic
        from services.langgraph_v10.src.agent.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec

        # Create test data that matches what the subgraph would generate
        asset_spec = {
            "asset": {
                "type": "document",
                "name": "Test Document 1",
                "project_id": project_id,
                "content": {
                    "source_document_id": doc_ids[0],
                    "extracted_content": "This is test extracted content",
                    "file_name": "test_doc_1.pdf",
                    "blob_url": f"/documents/{doc_ids[0]}",
                    "storage_path": f"/storage/{doc_ids[0]}.pdf"
                },
                "metadata": {
                    "category": "specification",
                    "extraction_method": "test",
                    "llm_outputs": {"confidence": 0.85}
                }
            },
            "idempotency_key": f"doc_extract:{project_id}:{doc_ids[0]}",
            "edges": []
        }

        # Convert to IdempotentAssetWriteSpec
        write_spec = IdempotentAssetWriteSpec(
            asset_type=asset_spec["asset"]["type"],
            asset_subtype="processed_document",
            name=asset_spec["asset"]["name"],
            description=f"Processed document: {asset_spec['asset']['name']}",
            project_id=project_id,
            metadata=asset_spec["asset"]["metadata"],
            content=asset_spec["asset"]["content"],
            idempotency_key=asset_spec["idempotency_key"],
            edges=asset_spec["edges"]
        )

        # Test persistence
        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ Document extraction core persistence: PASSED")
            return True
        else:
            print(f"   ❌ Document extraction core persistence: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ Document extraction core persistence: ERROR - {e}")
        return False

def test_project_details_persistence_core(project_id: str):
    """Test project details persistence core logic"""
    print("🏢 Testing Project Details Core...")

    try:
        from services.langgraph_v10.src.agent.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec

        asset_spec = {
            "asset": {
                "type": "plan",
                "name": "Test Project Details",
                "project_id": project_id,
                "content": {
                    "project_name": "Test Construction Project",
                    "project_address": "123 Test St, Test City",
                    "scope": "Test project scope",
                    "requirements": "Test requirements"
                },
                "metadata": {
                    "plan_type": "project_details",
                    "category": "project",
                    "extraction_method": "test"
                }
            },
            "idempotency_key": f"project_details:{project_id}",
            "edges": []
        }

        write_spec = IdempotentAssetWriteSpec(
            asset_type=asset_spec["asset"]["type"],
            asset_subtype="project_details",
            name=asset_spec["asset"]["name"],
            description="Extracted project details and metadata",
            project_id=project_id,
            metadata=asset_spec["asset"]["metadata"],
            content=asset_spec["asset"]["content"],
            idempotency_key=asset_spec["idempotency_key"],
            edges=asset_spec["edges"]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ Project details core persistence: PASSED")
            return True
        else:
            print(f"   ❌ Project details core persistence: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ Project details core persistence: ERROR - {e}")
        return False

def test_standards_persistence_core(project_id: str):
    """Test standards extraction persistence core logic"""
    print("📋 Testing Standards Extraction Core...")

    try:
        from services.langgraph_v10.src.agent.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec

        asset_spec = {
            "asset": {
                "type": "standard",
                "name": "AS 1289 - Methods of testing soils",
                "project_id": project_id,
                "content": {
                    "standard_code": "AS 1289",
                    "spec_name": "Methods of testing soils for engineering purposes",
                    "org_identifier": "SA",
                    "section_reference": "Section 3.1",
                    "context": "Soil testing requirements",
                    "found_in_database": True,
                    "document_ids": [str(uuid.uuid4())]
                },
                "metadata": {
                    "category": "register",
                    "extraction_method": "test"
                }
            },
            "idempotency_key": f"standard:{project_id}:AS 1289",
            "edges": []
        }

        write_spec = IdempotentAssetWriteSpec(
            asset_type=asset_spec["asset"]["type"],
            asset_subtype="standard",
            name=asset_spec["asset"]["name"],
            description="Extracted standard reference from project documents",
            project_id=project_id,
            metadata=asset_spec["asset"]["metadata"],
            content=asset_spec["asset"]["content"],
            idempotency_key=asset_spec["idempotency_key"],
            edges=asset_spec["edges"]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ Standards extraction core persistence: PASSED")
            return True
        else:
            print(f"   ❌ Standards extraction core persistence: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ Standards extraction core persistence: ERROR - {e}")
        return False

def test_plan_generation_persistence_core(project_id: str):
    """Test plan generation persistence core logic"""
    print("📋 Testing Plan Generation Core...")

    try:
        from services.langgraph_v10.src.agent.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec

        asset_spec = {
            "asset": {
                "type": "plan",
                "name": "Comprehensive Management Plans",
                "project_id": project_id,
                "content": {
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
                "metadata": {
                    "plan_type": "comprehensive_management",
                    "category": "management",
                    "extraction_method": "test"
                }
            },
            "idempotency_key": f"plans:{project_id}",
            "edges": []
        }

        write_spec = IdempotentAssetWriteSpec(
            asset_type=asset_spec["asset"]["type"],
            asset_subtype="management_plans",
            name=asset_spec["asset"]["name"],
            description="Generated comprehensive management plans",
            project_id=project_id,
            metadata=asset_spec["asset"]["metadata"],
            content=asset_spec["asset"]["content"],
            idempotency_key=asset_spec["idempotency_key"],
            edges=asset_spec["edges"]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ Plan generation core persistence: PASSED")
            return True
        else:
            print(f"   ❌ Plan generation core persistence: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ Plan generation core persistence: ERROR - {e}")
        return False

def test_wbs_persistence_core(project_id: str):
    """Test WBS extraction persistence core logic"""
    print("📋 Testing WBS Extraction Core...")

    try:
        from services.langgraph_v10.src.agent.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec

        asset_spec = {
            "asset": {
                "type": "plan",
                "name": "Work Breakdown Structure",
                "project_id": project_id,
                "content": {
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
                "metadata": {
                    "plan_type": "wbs",
                    "category": "planning",
                    "extraction_method": "test"
                }
            },
            "idempotency_key": f"wbs:{project_id}",
            "edges": []
        }

        write_spec = IdempotentAssetWriteSpec(
            asset_type=asset_spec["asset"]["type"],
            asset_subtype="wbs",
            name=asset_spec["asset"]["name"],
            description="Extracted Work Breakdown Structure",
            project_id=project_id,
            metadata=asset_spec["asset"]["metadata"],
            content=asset_spec["asset"]["content"],
            idempotency_key=asset_spec["idempotency_key"],
            edges=asset_spec["edges"]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ WBS extraction core persistence: PASSED")
            return True
        else:
            print(f"   ❌ WBS extraction core persistence: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ WBS extraction core persistence: ERROR - {e}")
        return False

def test_lbs_persistence_core(project_id: str):
    """Test LBS extraction persistence core logic"""
    print("📋 Testing LBS Extraction Core...")

    try:
        from services.langgraph_v10.src.agent.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec

        asset_spec = {
            "asset": {
                "type": "plan",
                "name": "Location-Based Schedule",
                "project_id": project_id,
                "content": {
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
                "metadata": {
                    "plan_type": "lbs",
                    "category": "scheduling",
                    "extraction_method": "test"
                }
            },
            "idempotency_key": f"lbs:{project_id}",
            "edges": []
        }

        write_spec = IdempotentAssetWriteSpec(
            asset_type=asset_spec["asset"]["type"],
            asset_subtype="lbs",
            name=asset_spec["asset"]["name"],
            description="Extracted Location-Based Schedule",
            project_id=project_id,
            metadata=asset_spec["asset"]["metadata"],
            content=asset_spec["asset"]["content"],
            idempotency_key=asset_spec["idempotency_key"],
            edges=asset_spec["edges"]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ LBS extraction core persistence: PASSED")
            return True
        else:
            print(f"   ❌ LBS extraction core persistence: FAILED - {result}")
            return False

    except Exception as e:
        print(f"   ❌ LBS extraction core persistence: ERROR - {e}")
        return False

def test_itp_persistence_core(project_id: str):
    """Test ITP generation persistence core logic"""
    print("📋 Testing ITP Generation Core...")

    try:
        from services.langgraph_v10.src.agent.action_graph_repo import upsertAssetsAndEdges, IdempotentAssetWriteSpec

        asset_spec = {
            "asset": {
                "type": "plan",
                "name": "Inspection and Test Plans",
                "project_id": project_id,
                "content": {
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
                "metadata": {
                    "plan_type": "itp",
                    "category": "quality",
                    "extraction_method": "test"
                }
            },
            "idempotency_key": f"itp:{project_id}",
            "edges": []
        }

        write_spec = IdempotentAssetWriteSpec(
            asset_type=asset_spec["asset"]["type"],
            asset_subtype="itp",
            name=asset_spec["asset"]["name"],
            description="Generated Inspection and Test Plans",
            project_id=project_id,
            metadata=asset_spec["asset"]["metadata"],
            content=asset_spec["asset"]["content"],
            idempotency_key=asset_spec["idempotency_key"],
            edges=asset_spec["edges"]
        )

        result = upsertAssetsAndEdges([write_spec])

        if result.get('success'):
            print("   ✅ ITP generation core persistence: PASSED")
            return True
        else:
            print(f"   ❌ ITP generation core persistence: FAILED - {result.get('error', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"   ❌ ITP generation core persistence: ERROR - {e}")
        return False

def verify_database_results(project_id: str):
    """Verify all assets were persisted successfully"""
    print(f"\n🔍 Verifying database results for project {project_id}...")

    from services.langgraph_v10.src.agent.action_graph_repo import get_database_url
    import psycopg2

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
            print("🎉 SUCCESS: All 7 subgraphs successfully persisted data!")
            print("✅ 7/7 core persistence functions working perfectly")
            print("✅ Database operations are functioning correctly")
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

    from services.langgraph_v10.src.agent.action_graph_repo import get_database_url
    import psycopg2

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
    """Run the core persistence test for all 7 subgraph functions"""
    print("🚀 CORE PERSISTENCE TEST: ALL 7 SUBGRAPH FUNCTIONS")
    print("Testing the actual database persistence logic directly")
    print("=" * 70)

    try:
        success = test_core_persistence()

        print("\n" + "=" * 70)
        if success:
            print("🎉 MISSION ACCOMPLISHED!")
            print("✅ ALL 7 CORE PERSISTENCE FUNCTIONS WORKING!")
            print("✅ Database persistence logic is solid")
            print("✅ Subgraph persistence architecture is functional")
            print("✅ Ready for production use")
            print()
            print("🏆 RESULT: 7/7 SUCCESS ACHIEVED!")
            print("The persistence layer is working perfectly!")
        else:
            print("⚠️ SOME CORE FUNCTIONS NEED FIXES")
            print("🔧 Focus on the database persistence logic")

    except Exception as e:
        print(f"\n💥 TEST SUITE CRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
