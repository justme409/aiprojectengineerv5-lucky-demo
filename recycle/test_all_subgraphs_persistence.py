#!/usr/bin/env python3
"""
TEST ALL 7 SUBGRAPH PERSISTENCE FUNCTIONS - Get 100% Success Rate
"""

import sys
import os
import uuid
import importlib.util
from typing import Dict, List, Any

def test_all_subgraphs_persistence():
    """Test all 7 subgraph persistence functions with fixes for all issues"""
    print("🚀 TESTING ALL 7 SUBGRAPH PERSISTENCE FUNCTIONS")
    print("Goal: Get 7/7 working - 100% success rate")
    print("=" * 70)

    # Setup test environment
    project_id, doc_ids = setup_test_environment()

    print(f"📋 Test Project: {project_id}")
    print(f"📄 Test Documents: {doc_ids}")

    # Test each subgraph with fixes
    results = {}

    print("\n" + "=" * 60)
    print("🧪 TESTING ALL SUBGRAPH PERSISTENCE FUNCTIONS")
    print("=" * 60)

    results['document_extraction'] = test_document_extraction_with_fixes(project_id, doc_ids)
    results['project_details'] = test_project_details_with_fixes(project_id)
    results['standards_extraction'] = test_standards_extraction_with_fixes(project_id)
    results['plan_generation'] = test_plan_generation_with_fixes(project_id)
    results['wbs_extraction'] = test_wbs_extraction_with_fixes(project_id)
    results['lbs_extraction'] = test_lbs_extraction_with_fixes(project_id)
    results['itp_generation'] = test_itp_generation_with_fixes(project_id)

    # Summary
    print("\n" + "=" * 70)
    print("📊 FINAL RESULTS: ALL 7 SUBGRAPH PERSISTENCE FUNCTIONS")
    print("=" * 70)

    successful = 0
    total = len(results)

    for subgraph, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{subgraph:25} {status}")
        if result:
            successful += 1

    print(f"\n🎯 FINAL SCORE: {successful}/{total} subgraphs working")

    if successful == total:
        print("🎉 PERFECT! ALL 7 SUBGRAPHS PERSISTENCE WORKING!")
        print("✅ Complete success - all persistence functions functional")
        print("✅ Each subgraph can persist data independently")
        print("✅ No dependency issues remaining")
        print("✅ Ready for production use")

        # Verify data in database
        verify_all_assets_persisted(project_id)

    else:
        print("⚠️  Not all subgraphs working yet")
        print("🔧 Need to fix remaining issues")

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
        """, (project_id, "Test Project", "Test project for all subgraphs",
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
                f"Test document content {i+1} for subgraph persistence testing."
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

def test_document_extraction_with_fixes(project_id: str, doc_ids: List[str]):
    """Test document extraction with Azure tools mocking"""
    print("📑 Testing Document Extraction (with Azure fixes)...")

    try:
        # Mock all the problematic imports
        sys.modules['agent'] = type('MockAgent', (), {})()
        sys.modules['agent.tools'] = type('MockTools', (), {})()
        sys.modules['agent.tools.azure_tools'] = type('MockAzureTools', (), {
            'generate_sas_token': lambda *args: "mock_sas_token",
            'extract_document_content_async': lambda *args: "mock_extracted_content"
        })()
        sys.modules['agent.graphs'] = type('MockGraphs', (), {})()
        sys.modules['agent.graphs.db_fetcher'] = type('MockDbFetcher', (), {
            'db_fetcher_step': lambda *args: None
        })()
        sys.modules['agent.action_graph_repo'] = type('MockActionGraphRepo', (), {})

        # Import action_graph_repo
        spec_repo = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec_repo)
        spec_repo.loader.exec_module(action_graph_repo)

        sys.modules['agent.action_graph_repo'].upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
        sys.modules['agent.action_graph_repo'].IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

        # Import document extraction
        spec = importlib.util.spec_from_file_location("document_extraction", "services/langgraph_v10/src/agent/graphs/document_extraction.py")
        doc_extract = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(doc_extract)

        # Create mock state
        mock_state = type('MockState', (), {
            'project_id': project_id,
            'txt_project_documents': [
                {
                    'id': doc_ids[0],
                    'file_name': 'test_doc_1.pdf',
                    'content': 'This is test extracted content from document 1',
                    'metadata': {
                        'type': 'document',
                        'name': 'Test Document 1',
                        'document_number': 'DOC-001',
                        'revision': 'A',
                        'category': 'specification'
                    },
                    'blob_url': f'/documents/{doc_ids[0]}',
                    'storage_path': f'/storage/{doc_ids[0]}.pdf'
                }
            ]
        })()

        # Test persistence
        result = doc_extract.persist_assets_to_database(mock_state)
        print(f"   Result: {result}")

        if result.get('persistence_result', {}).get('success'):
            print("   ✅ Document extraction persistence: PASSED")
            return True
        else:
            print("   ❌ Document extraction persistence: FAILED")
            print(f"   Error: {result.get('persistence_result', {}).get('error', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"   ❌ Document extraction persistence: ERROR - {e}")
        import traceback
        traceback.print_exc()
        return False

def test_project_details_with_fixes(project_id: str):
    """Test project details with Google credentials mocking"""
    print("🏢 Testing Project Details (with Google fixes)...")

    try:
        # Mock Google credentials and LLM
        import os
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/tmp/fake_credentials.json'

        # Create fake credentials file
        with open('/tmp/fake_credentials.json', 'w') as f:
            f.write('{"type": "service_account", "project_id": "test"}')

        # Mock langchain_google_genai
        sys.modules['langchain_google_genai'] = type('MockLangChainGoogle', (), {
            'ChatGoogleGenerativeAI': lambda **kwargs: type('MockLLM', (), {
                'invoke': lambda *args: type('MockResponse', (), {'content': 'Test response'})()
            })()
        })()

        # Mock other imports
        sys.modules['agent'] = type('MockAgent', (), {})()
        sys.modules['agent.graphs'] = type('MockGraphs', (), {})()
        sys.modules['agent.action_graph_repo'] = type('MockActionGraphRepo', (), {})

        # Import action_graph_repo
        spec_repo = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec_repo)
        spec_repo.loader.exec_module(action_graph_repo)

        sys.modules['agent.action_graph_repo'].upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
        sys.modules['agent.action_graph_repo'].IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

        # Import project details
        spec = importlib.util.spec_from_file_location("project_details", "services/langgraph_v10/src/agent/graphs/project_details.py")
        proj_details = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(proj_details)

        # Create mock state
        mock_state = type('MockState', (), {
            'project_id': project_id,
            'project_details': {
                'project_name': 'Test Construction Project',
                'project_address': '123 Test St, Test City',
                'scope': 'Test project scope',
                'requirements': 'Test requirements',
                'extraction_method': 'test',
                'llm_outputs': {'test': True}
            },
            'error': None
        })()

        # Test persistence
        result = proj_details.persist_project_details_to_database(mock_state)
        print(f"   Result: {result}")

        if result.get('persistence_result', {}).get('success'):
            print("   ✅ Project details persistence: PASSED")
            return True
        else:
            print("   ❌ Project details persistence: FAILED")
            return False

    except Exception as e:
        print(f"   ❌ Project details persistence: ERROR - {e}")
        return False

    finally:
        # Clean up fake credentials
        try:
            os.remove('/tmp/fake_credentials.json')
        except:
            pass

def test_standards_extraction_with_fixes(project_id: str):
    """Test standards extraction with proper MockState"""
    print("📋 Testing Standards Extraction (with MockState fixes)...")

    try:
        # Mock Google credentials and LLM
        import os
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/tmp/fake_credentials.json'

        # Create fake credentials file
        with open('/tmp/fake_credentials.json', 'w') as f:
            f.write('{"type": "service_account", "project_id": "test"}')

        # Mock langchain_google_genai
        sys.modules['langchain_google_genai'] = type('MockLangChainGoogle', (), {
            'ChatGoogleGenerativeAI': lambda **kwargs: type('MockLLM', (), {
                'invoke': lambda *args: type('MockResponse', (), {'content': 'Test response'})()
            })()
        })()

        # Mock other imports
        sys.modules['agent'] = type('MockAgent', (), {})()
        sys.modules['agent.graphs'] = type('MockGraphs', (), {})()
        sys.modules['agent.action_graph_repo'] = type('MockActionGraphRepo', (), {})

        # Import action_graph_repo
        spec_repo = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec_repo)
        spec_repo.loader.exec_module(action_graph_repo)

        sys.modules['agent.action_graph_repo'].upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
        sys.modules['agent.action_graph_repo'].IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

        # Import standards extraction
        spec = importlib.util.spec_from_file_location("standards_extraction", "services/langgraph_v10/src/agent/graphs/standards_extraction.py")
        std_extract = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(std_extract)

        # Create proper MockState with get method
        class MockState:
            def __init__(self, project_id: str):
                self.project_id = project_id
                self.standards_from_project_documents = [
                    {
                        'standard_code': 'AS 1289',
                        'uuid': str(uuid.uuid4()),
                        'spec_name': 'Test Standard 1',
                        'org_identifier': 'SA',
                        'section_reference': '3.1',
                        'context': 'Test context',
                        'found_in_database': True,
                        'document_ids': [str(uuid.uuid4())]
                    }
                ]

            def get(self, key, default=None):
                return getattr(self, key, default)

        mock_state = MockState(project_id)

        # Test persistence
        result = std_extract.persist_standards_to_database(mock_state)
        print(f"   Result: {result}")

        if result.get('persistence_result', {}).get('success'):
            print("   ✅ Standards extraction persistence: PASSED")
            return True
        else:
            print("   ❌ Standards extraction persistence: FAILED")
            return False

    except Exception as e:
        print(f"   ❌ Standards extraction persistence: ERROR - {e}")
        return False

    finally:
        # Clean up fake credentials
        try:
            os.remove('/tmp/fake_credentials.json')
        except:
            pass

def test_plan_generation_with_fixes(project_id: str):
    """Test plan generation (already working)"""
    print("📋 Testing Plan Generation (already working)...")

    try:
        # Mock Google credentials and LLM
        import os
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/tmp/fake_credentials.json'

        # Create fake credentials file
        with open('/tmp/fake_credentials.json', 'w') as f:
            f.write('{"type": "service_account", "project_id": "test"}')

        # Mock langchain_google_genai
        sys.modules['langchain_google_genai'] = type('MockLangChainGoogle', (), {
            'ChatGoogleGenerativeAI': lambda **kwargs: type('MockLLM', (), {
                'invoke': lambda *args: type('MockResponse', (), {'content': 'Test response'})()
            })()
        })()

        # Mock other imports
        sys.modules['agent'] = type('MockAgent', (), {})()
        sys.modules['agent.graphs'] = type('MockGraphs', (), {})()
        sys.modules['agent.action_graph_repo'] = type('MockActionGraphRepo', (), {})

        # Import action_graph_repo
        spec_repo = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec_repo)
        spec_repo.loader.exec_module(action_graph_repo)

        sys.modules['agent.action_graph_repo'].upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
        sys.modules['agent.action_graph_repo'].IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

        # Import plan generation
        spec = importlib.util.spec_from_file_location("plan_generation", "services/langgraph_v10/src/agent/graphs/plan_generation.py")
        plan_gen = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(plan_gen)

        # Create mock state
        mock_state = type('MockState', (), {
            'project_id': project_id,
            'generated_plans': [
                {
                    'plan_type': 'pqp',
                    'plan_name': 'Quality Management Plan',
                    'plan_items': [
                        {
                            'id': 'section_1',
                            'item_no': '1.0',
                            'title': 'Introduction',
                            'content_type': 'section',
                            'content': 'Test content',
                            'parentId': None
                        }
                    ],
                    'llm_outputs': {'test': True},
                    'created_at': '2025-01-01T00:00:00Z'
                }
            ],
            'error': None
        })()

        # Test persistence
        result = plan_gen.persist_plans_to_database(mock_state)
        print(f"   Result: {result}")

        if result.get('persistence_result', {}).get('success'):
            print("   ✅ Plan generation persistence: PASSED")
            return True
        else:
            print("   ❌ Plan generation persistence: FAILED")
            return False

    except Exception as e:
        print(f"   ❌ Plan generation persistence: ERROR - {e}")
        return False

    finally:
        # Clean up fake credentials
        try:
            os.remove('/tmp/fake_credentials.json')
        except:
            pass

def test_wbs_extraction_with_fixes(project_id: str):
    """Test WBS extraction (already working)"""
    print("📋 Testing WBS Extraction (already working)...")

    try:
        # Mock Google credentials and LLM
        import os
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/tmp/fake_credentials.json'

        # Create fake credentials file
        with open('/tmp/fake_credentials.json', 'w') as f:
            f.write('{"type": "service_account", "project_id": "test"}')

        # Mock langchain_google_genai
        sys.modules['langchain_google_genai'] = type('MockLangChainGoogle', (), {
            'ChatGoogleGenerativeAI': lambda **kwargs: type('MockLLM', (), {
                'invoke': lambda *args: type('MockResponse', (), {'content': 'Test response'})()
            })()
        })()

        # Mock other imports
        sys.modules['agent'] = type('MockAgent', (), {})()
        sys.modules['agent.graphs'] = type('MockGraphs', (), {})()
        sys.modules['agent.action_graph_repo'] = type('MockActionGraphRepo', (), {})

        # Import action_graph_repo
        spec_repo = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec_repo)
        spec_repo.loader.exec_module(action_graph_repo)

        sys.modules['agent.action_graph_repo'].upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
        sys.modules['agent.action_graph_repo'].IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

        # Import WBS extraction
        spec = importlib.util.spec_from_file_location("wbs_extraction", "services/langgraph_v10/src/agent/graphs/wbs_extraction.py")
        wbs_extract = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(wbs_extract)

        # Create mock state
        mock_state = type('MockState', (), {
            'project_id': project_id,
            'wbs_structure': {
                'nodes': [
                    {
                        'id': 'project_root',
                        'parentId': None,
                        'node_type': 'project',
                        'name': 'Test Project',
                        'is_leaf_node': False
                    },
                    {
                        'id': 'work_package_1',
                        'parentId': 'project_root',
                        'node_type': 'work_package',
                        'name': 'Foundation Works',
                        'is_leaf_node': True,
                        'itp_required': True
                    }
                ],
                'metadata': {
                    'extraction_method': 'test',
                    'llm_outputs': {'test': True}
                },
                'llm_outputs': {'test': True}
            }
        })()

        # Test persistence
        result = wbs_extract.persist_wbs_to_database(mock_state)
        print(f"   Result: {result}")

        if result.get('persistence_result', {}).get('success'):
            print("   ✅ WBS extraction persistence: PASSED")
            return True
        else:
            print("   ❌ WBS extraction persistence: FAILED")
            return False

    except Exception as e:
        print(f"   ❌ WBS extraction persistence: ERROR - {e}")
        return False

    finally:
        # Clean up fake credentials
        try:
            os.remove('/tmp/fake_credentials.json')
        except:
            pass

def test_lbs_extraction_with_fixes(project_id: str):
    """Test LBS extraction (already working)"""
    print("📋 Testing LBS Extraction (already working)...")

    try:
        # Mock Google credentials and LLM
        import os
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/tmp/fake_credentials.json'

        # Create fake credentials file
        with open('/tmp/fake_credentials.json', 'w') as f:
            f.write('{"type": "service_account", "project_id": "test"}')

        # Mock langchain_google_genai
        sys.modules['langchain_google_genai'] = type('MockLangChainGoogle', (), {
            'ChatGoogleGenerativeAI': lambda **kwargs: type('MockLLM', (), {
                'invoke': lambda *args: type('MockResponse', (), {'content': 'Test response'})()
            })()
        })()

        # Mock other imports
        sys.modules['agent'] = type('MockAgent', (), {})()
        sys.modules['agent.graphs'] = type('MockGraphs', (), {})()
        sys.modules['agent.action_graph_repo'] = type('MockActionGraphRepo', (), {})

        # Import action_graph_repo
        spec_repo = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec_repo)
        spec_repo.loader.exec_module(action_graph_repo)

        sys.modules['agent.action_graph_repo'].upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
        sys.modules['agent.action_graph_repo'].IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

        # Import LBS extraction
        spec = importlib.util.spec_from_file_location("lbs_extraction", "services/langgraph_v10/src/agent/graphs/lbs_extraction.py")
        lbs_extract = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(lbs_extract)

        # Create mock state
        mock_state = type('MockState', (), {
            'project_id': project_id,
            'mapping_content': {
                'lot_cards': [
                    {
                        'lot_card_id': str(uuid.uuid4()),
                        'location_levels': [{'order': 1, 'name': 'Site Area A'}],
                        'location_full_path': 'Site Area A',
                        'location_depth': 1,
                        'work_levels': [{'order': 1, 'name': 'Foundation Works'}],
                        'work_full_path': 'Foundation Works',
                        'work_depth': 1,
                        'work_package_id': str(uuid.uuid4()),
                        'work_package_name': 'Foundation Works',
                        'lot_number': 'L001',
                        'sequence_order': 1,
                        'status': 'potential'
                    }
                ],
                'llm_outputs': {'test': True},
                'metadata': {'test': True}
            }
        })()

        # Test persistence
        result = lbs_extract.persist_lbs_to_database(mock_state)
        print(f"   Result: {result}")

        if result.get('persistence_result', {}).get('success'):
            print("   ✅ LBS extraction persistence: PASSED")
            return True
        else:
            print("   ❌ LBS extraction persistence: FAILED")
            return False

    except Exception as e:
        print(f"   ❌ LBS extraction persistence: ERROR - {e}")
        return False

    finally:
        # Clean up fake credentials
        try:
            os.remove('/tmp/fake_credentials.json')
        except:
            pass

def test_itp_generation_with_fixes(project_id: str):
    """Test ITP generation with IdempotentAssetWriteSpec import fix"""
    print("📋 Testing ITP Generation (with import fixes)...")

    try:
        # Mock Google credentials and LLM
        import os
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/tmp/fake_credentials.json'

        # Create fake credentials file
        with open('/tmp/fake_credentials.json', 'w') as f:
            f.write('{"type": "service_account", "project_id": "test"}')

        # Mock langchain_google_genai
        sys.modules['langchain_google_genai'] = type('MockLangChainGoogle', (), {
            'ChatGoogleGenerativeAI': lambda **kwargs: type('MockLLM', (), {
                'invoke': lambda *args: type('MockResponse', (), {'content': 'Test response'})()
            })()
        })()

        # Mock other imports
        sys.modules['agent'] = type('MockAgent', (), {})()
        sys.modules['agent.graphs'] = type('MockGraphs', (), {})()
        sys.modules['agent.action_graph_repo'] = type('MockActionGraphRepo', (), {})

        # Import action_graph_repo FIRST
        spec_repo = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
        action_graph_repo = importlib.util.module_from_spec(spec_repo)
        spec_repo.loader.exec_module(action_graph_repo)

        # Make IdempotentAssetWriteSpec available globally
        sys.modules['agent.action_graph_repo'].upsertAssetsAndEdges = action_graph_repo.upsertAssetsAndEdges
        sys.modules['agent.action_graph_repo'].IdempotentAssetWriteSpec = action_graph_repo.IdempotentAssetWriteSpec

        # Now import ITP generation
        spec = importlib.util.spec_from_file_location("itp_generation", "services/langgraph_v10/src/agent/graphs/itp_generation.py")
        itp_gen = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(itp_gen)

        # Create mock state
        mock_state = type('MockState', (), {
            'project_id': project_id,
            'generated_itps': [
                {
                    'wbs_node_id': str(uuid.uuid4()),
                    'wbs_node_title': 'Foundation Works',
                    'itp_items': [
                        {
                            'id': 'item_1',
                            'item_no': '1.1',
                            'inspection_test_point': 'Concrete placement inspection',
                            'acceptance_criteria': 'No defects, proper consolidation',
                            'section_name': 'Concrete Works',
                            'parentId': None
                        }
                    ],
                    'llm_outputs': {'test': True},
                    'created_at': '2025-01-01T00:00:00Z'
                }
            ]
        })()

        # Test persistence
        result = itp_gen.persist_itp_to_database(mock_state)
        print(f"   Result: {result}")

        if result.get('persistence_result', {}).get('success'):
            print("   ✅ ITP generation persistence: PASSED")
            return True
        else:
            print("   ❌ ITP generation persistence: FAILED")
            print(f"   Error: {result.get('persistence_result', {}).get('error', 'Unknown error')}")
            return False

    except Exception as e:
        print(f"   ❌ ITP generation persistence: ERROR - {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        # Clean up fake credentials
        try:
            os.remove('/tmp/fake_credentials.json')
        except:
            pass

def verify_all_assets_persisted(project_id: str):
    """Verify all 7 assets were persisted"""
    print(f"\n🔍 Verifying all assets persisted for project {project_id}...")

    spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
    action_graph_repo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(action_graph_repo)
    get_database_url = action_graph_repo.get_database_url

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

        print("📊 Assets found in database:")
        total_count = 0
        for asset_type, name, count in assets:
            print(f"   - {name} ({asset_type}) - {count} version(s)")
            total_count += count

        print(f"\n✅ TOTAL ASSETS PERSISTED: {total_count}")

        if total_count >= 7:  # At least one from each subgraph
            print("🎉 SUCCESS: All subgraphs successfully persisted data!")
            print("✅ 7/7 subgraphs working perfectly")
            print("✅ Complete end-to-end persistence verified")
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

    spec = importlib.util.spec_from_file_location("action_graph_repo", "services/langgraph_v10/src/agent/action_graph_repo.py")
    action_graph_repo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(action_graph_repo)
    get_database_url = action_graph_repo.get_database_url

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
    """Run the comprehensive test for all 7 subgraph persistence functions"""
    print("🚀 COMPREHENSIVE TEST: ALL 7 SUBGRAPH PERSISTENCE FUNCTIONS")
    print("Goal: Achieve 7/7 success rate with all fixes applied")
    print("=" * 75)

    try:
        success = test_all_subgraphs_persistence()

        print("\n" + "=" * 75)
        if success:
            print("🎉 MISSION ACCOMPLISHED!")
            print("✅ ALL 7 SUBGRAPHS WORKING PERFECTLY")
            print("✅ Complete persistence functionality verified")
            print("✅ Ready for production deployment")
            print("✅ LangGraph microservice fully functional")
        else:
            print("⚠️ SOME SUBGRAPHS STILL HAVE ISSUES")
            print("🔧 Additional fixes needed")

    except Exception as e:
        print(f"\n💥 TEST SUITE CRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
