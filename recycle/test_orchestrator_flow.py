#!/usr/bin/env python3
"""
TEST ORCHESTRATOR FLOW - Debug why persistence isn't being called
"""

import sys
import os
import uuid
import importlib.util
from typing import Dict, List, Any

def test_orchestrator_asset_creation():
    """Test if subgraphs create asset_specs correctly"""
    print("🔍 Testing Orchestrator Asset Creation")
    print("=" * 50)

    # Create mock project and documents
    project_id = str(uuid.uuid4())
    doc_ids = [str(uuid.uuid4()), str(uuid.uuid4())]

    print(f"📋 Test Project ID: {project_id}")
    print(f"📄 Test Document IDs: {doc_ids}")

    # Test each subgraph's asset creation function
    test_subgraph_asset_creation("document_extraction", project_id, doc_ids)
    test_subgraph_asset_creation("project_details", project_id, [])
    test_subgraph_asset_creation("standards_extraction", project_id, [])
    test_subgraph_asset_creation("plan_generation", project_id, [])
    test_subgraph_asset_creation("wbs_extraction", project_id, [])
    test_subgraph_asset_creation("lbs_extraction", project_id, [])
    test_subgraph_asset_creation("itp_generation", project_id, [])

def test_subgraph_asset_creation(subgraph_name: str, project_id: str, doc_ids: List[str]):
    """Test individual subgraph asset creation"""
    print(f"\n📊 Testing {subgraph_name}...")

    try:
        # Import the subgraph module directly
        spec = importlib.util.spec_from_file_location(
            subgraph_name,
            f"services/langgraph_v10/src/agent/graphs/{subgraph_name}.py"
        )
        subgraph = importlib.util.module_from_spec(spec)

        # Create a mock state for testing
        if subgraph_name == "document_extraction":
            mock_state = create_mock_document_state(project_id, doc_ids)
            spec.loader.exec_module(subgraph)
            asset_specs = subgraph.create_asset_write_specs(mock_state)

        elif subgraph_name == "project_details":
            mock_state = create_mock_project_details_state(project_id)
            spec.loader.exec_module(subgraph)
            asset_spec = subgraph.create_project_details_asset_spec(mock_state)
            asset_specs = [asset_spec] if asset_spec else []

        elif subgraph_name == "standards_extraction":
            mock_state = create_mock_standards_state(project_id)
            spec.loader.exec_module(subgraph)
            asset_specs = subgraph.create_standards_asset_specs(mock_state)

        elif subgraph_name == "plan_generation":
            mock_state = create_mock_plan_state(project_id)
            spec.loader.exec_module(subgraph)
            asset_spec = subgraph.create_plan_asset_spec(mock_state)
            asset_specs = [asset_spec] if asset_spec else []

        elif subgraph_name == "wbs_extraction":
            mock_state = create_mock_wbs_state(project_id)
            spec.loader.exec_module(subgraph)
            asset_spec = subgraph.create_wbs_asset_spec(mock_state)
            asset_specs = [asset_spec] if asset_spec else []

        elif subgraph_name == "lbs_extraction":
            mock_state = create_mock_lbs_state(project_id)
            spec.loader.exec_module(subgraph)
            asset_spec = subgraph.create_lbs_asset_spec(mock_state)
            asset_specs = [asset_spec] if asset_spec else []

        elif subgraph_name == "itp_generation":
            mock_state = create_mock_itp_state(project_id)
            spec.loader.exec_module(subgraph)
            asset_spec = subgraph.create_itp_asset_spec(mock_state)
            asset_specs = [asset_spec] if asset_spec else []

        else:
            print(f"❌ Unknown subgraph: {subgraph_name}")
            return

        print(f"✅ {subgraph_name}: Created {len(asset_specs)} asset specs")

        # Show details of created assets
        for i, spec in enumerate(asset_specs):
            if spec:
                print(f"   {i+1}. {spec.get('asset', {}).get('name', 'Unknown')} ({spec.get('asset', {}).get('type', 'unknown')})")

        return asset_specs

    except Exception as e:
        print(f"❌ {subgraph_name}: Failed to create asset specs - {e}")
        import traceback
        traceback.print_exc()
        return []

def create_mock_document_state(project_id: str, doc_ids: List[str]):
    """Create mock state for document extraction"""
    return type('MockState', (), {
        'project_id': project_id,
        'txt_project_documents': [
            {
                'id': doc_ids[0],
                'file_name': 'test_doc_1.pdf',
                'content': 'Test content 1',
                'metadata': {
                    'type': 'document',
                    'name': 'Test Document 1',
                    'document_number': 'DOC-001',
                    'revision': 'A',
                    'category': 'specification'
                },
                'blob_url': f'/documents/{doc_ids[0]}',
                'storage_path': f'/storage/{doc_ids[0]}.pdf'
            },
            {
                'id': doc_ids[1],
                'file_name': 'test_doc_2.pdf',
                'content': 'Test content 2',
                'metadata': {
                    'type': 'document',
                    'name': 'Test Document 2',
                    'document_number': 'DOC-002',
                    'revision': 'A',
                    'category': 'contract'
                },
                'blob_url': f'/documents/{doc_ids[1]}',
                'storage_path': f'/storage/{doc_ids[1]}.pdf'
            }
        ]
    })()

def create_mock_project_details_state(project_id: str):
    """Create mock state for project details"""
    return type('MockState', (), {
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

def create_mock_standards_state(project_id: str):
    """Create mock state for standards extraction"""
    return type('MockState', (), {
        'project_id': project_id,
        'standards_from_project_documents': [
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
    })()

def create_mock_plan_state(project_id: str):
    """Create mock state for plan generation"""
    return type('MockState', (), {
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

def create_mock_wbs_state(project_id: str):
    """Create mock state for WBS extraction"""
    return type('MockState', (), {
        'project_id': project_id,
        'wbs_structure': {
            'nodes': [
                {
                    'id': 'project_root',
                    'parentId': None,
                    'node_type': 'project',
                    'name': 'Test Project',
                    'is_leaf_node': False
                }
            ],
            'metadata': {
                'extraction_method': 'test',
                'llm_outputs': {'test': True}
            },
            'llm_outputs': {'test': True}
        }
    })()

def create_mock_lbs_state(project_id: str):
    """Create mock state for LBS extraction"""
    return type('MockState', (), {
        'project_id': project_id,
        'mapping_content': {
            'lot_cards': [
                {
                    'lot_card_id': str(uuid.uuid4()),
                    'location_levels': [{'order': 1, 'name': 'Test Location'}],
                    'location_full_path': 'Test Location',
                    'location_depth': 1,
                    'work_levels': [{'order': 1, 'name': 'Test Work'}],
                    'work_full_path': 'Test Work',
                    'work_depth': 1,
                    'work_package_id': str(uuid.uuid4()),
                    'work_package_name': 'Test Package',
                    'lot_number': 'L001',
                    'sequence_order': 1,
                    'status': 'potential'
                }
            ],
            'llm_outputs': {'test': True},
            'metadata': {'test': True}
        }
    })()

def create_mock_itp_state(project_id: str):
    """Create mock state for ITP generation"""
    return type('MockState', (), {
        'project_id': project_id,
        'generated_itps': [
            {
                'wbs_node_id': str(uuid.uuid4()),
                'wbs_node_title': 'Test WBS Node',
                'itp_items': [
                    {
                        'id': 'item_1',
                        'item_no': '1.1',
                        'inspection_test_point': 'Test Point',
                        'acceptance_criteria': 'Test criteria',
                        'section_name': 'Test Section',
                        'parentId': None
                    }
                ],
                'llm_outputs': {'test': True},
                'created_at': '2025-01-01T00:00:00Z'
            }
        ]
    })()

def main():
    """Run the orchestrator asset creation test"""
    print("🚀 TESTING ORCHESTRATOR ASSET CREATION")
    print("This will test if each subgraph creates asset_specs correctly")
    print("=" * 60)

    try:
        test_orchestrator_asset_creation()

        print("\n" + "=" * 60)
        print("🎯 SUMMARY:")
        print("If all subgraphs show 'Created X asset specs' then they're working")
        print("If any show '0 asset specs' or errors, that's the issue")
        print("The orchestrator should accumulate all these specs and persist them")

    except Exception as e:
        print(f"\n💥 TEST CRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
