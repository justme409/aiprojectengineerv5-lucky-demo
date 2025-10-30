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


def verify_processed_document(project_id: str, source_document_id: str) -> bool:
    row = wait_for_row(
        query=(
            "SELECT id, type, name, idempotency_key FROM public.assets "
            "WHERE project_id = :pid AND type = 'document' "
            "AND content->>'source_document_id' = :sdid AND is_current = true"
        ),
        params={"pid": project_id, "sdid": source_document_id},
    )
    print({"check": "processed_document", "found": bool(row), "row": row})
    return bool(row)


def verify_project_details(project_id: str) -> bool:
    row = wait_for_row(
        query=(
            "SELECT id, type, name, idempotency_key FROM public.assets "
            "WHERE project_id = :pid AND type = 'project' "
            "AND idempotency_key = :ikey AND is_current = true"
        ),
        params={"pid": project_id, "ikey": f"project_details:{project_id}"},
    )
    print({"check": "project_details", "found": bool(row), "row": row})
    return bool(row)


def verify_standards(project_id: str) -> bool:
    row = wait_for_row(
        query=(
            "SELECT id FROM public.assets WHERE project_id = :pid AND type = 'standard' AND is_current = true LIMIT 1"
        ),
        params={"pid": project_id},
    )
    print({"check": "standards", "found": bool(row), "row": row})
    return bool(row)


def verify_plan_asset(project_id: str, plan_type: str) -> bool:
    row = wait_for_row(
        query=(
            "SELECT id, type, name, idempotency_key FROM public.assets "
            "WHERE project_id = :pid AND type = 'plan' AND is_current = true "
            "AND idempotency_key = :ikey"
        ),
        params={"pid": project_id, "ikey": f"plan:{project_id}:{plan_type}"},
    )
    print({"check": f"plan:{plan_type}", "found": bool(row), "row": row})
    return bool(row)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/verify_upserts.py <check> <project_id> [extra]")
        print("Checks: processed_document <source_document_id> | project_details | standards | plan <plan_type>")
        sys.exit(2)
    check = sys.argv[1]
    pid = sys.argv[2]
    if check == "processed_document":
        ok = verify_processed_document(pid, sys.argv[3])
        sys.exit(0 if ok else 1)
    if check == "project_details":
        ok = verify_project_details(pid)
        sys.exit(0 if ok else 1)
    if check == "standards":
        ok = verify_standards(pid)
        sys.exit(0 if ok else 1)
    if check == "plan":
        ok = verify_plan_asset(pid, sys.argv[3])
        sys.exit(0 if ok else 1)
    print("Unknown check")
    sys.exit(2)



