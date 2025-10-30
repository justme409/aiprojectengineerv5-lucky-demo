import os
import sys
import time
from typing import Optional, Dict, Any

from sqlalchemy import create_engine, text


def get_db_url() -> str:
    url = os.getenv("DATABASE_URL")
    if url:
        # Normalize scheme for SQLAlchemy if needed
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5555")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "password")
    database = os.getenv("DB_NAME", "projectpro")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"


def wait_for_row(query: str, params: Dict[str, Any], timeout_s: int = 30) -> Optional[Dict[str, Any]]:
    engine = create_engine(get_db_url())
    deadline = time.time() + timeout_s
    with engine.connect() as conn:
        while time.time() < deadline:
            row = conn.execute(text(query), params).mappings().fetchone()
            if row:
                return dict(row)
            time.sleep(0.5)
    return None


def verify_document_extraction_upsert(project_id: str, source_document_id: str) -> bool:
    """Verify that document extraction output was properly upserted to database"""
    # Check for processed document asset with the correct idempotency key
    expected_idempotency = f"doc_extract:{project_id}:{source_document_id}"
    row = wait_for_row(
        query=(
            "SELECT id, type, name, idempotency_key, content "
            "FROM public.assets "
            "WHERE project_id = :pid AND type = 'document' "
            "AND idempotency_key = :ikey AND is_current = true"
        ),
        params={"pid": project_id, "ikey": expected_idempotency},
    )

    if not row:
        print({"check": "document_extraction_upsert", "found": False, "expected_idempotency": expected_idempotency, "error": "No processed document asset found"})
        return False

    # Check if content contains extracted text
    content = row.get('content', {})
    if not content:
        print({"check": "document_extraction_upsert", "found": True, "error": "No content in processed document"})
        return False

    # Verify source document ID is present
    if content.get('source_document_id') != source_document_id:
        print({"check": "document_extraction_upsert", "found": True, "source_document_id": content.get('source_document_id'), "error": "Source document ID mismatch"})
        return False

    # Check for extracted content (should have some text content)
    extracted_content = content.get('extracted_content') or content.get('content')
    if not extracted_content or len(str(extracted_content).strip()) == 0:
        print({"check": "document_extraction_upsert", "found": True, "error": "No extracted content found"})
        return False

    print({"check": "document_extraction_upsert", "found": True, "asset_id": row['id'], "content_length": len(str(extracted_content))})
    return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/verify_document_extraction.py <project_id> <source_document_id>")
        sys.exit(2)

    project_id = sys.argv[1]
    source_document_id = sys.argv[2]

    ok = verify_document_extraction_upsert(project_id, source_document_id)
    sys.exit(0 if ok else 1)
