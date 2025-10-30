#!/usr/bin/env python3

import psycopg2
import json

def get_db_connection():
    return psycopg2.connect(
        host="127.0.0.1",
        port="5555",
        database="projectpro",
        user="postgres",
        password="password"
    )

def fetch_reference_documents():
    """Fetch all reference documents metadata from DB."""
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, spec_id, spec_name, org_identifier FROM reference_documents ORDER BY org_identifier, spec_id")
        results = cursor.fetchall()
    conn.close()
    return [{"id": str(r[0]), "spec_id": r[1], "spec_name": r[2], "org_identifier": r[3]} for r in results]

def main():
    print("Testing reference_documents table...")
    docs = fetch_reference_documents()
    print(f"✅ Successfully fetched {len(docs)} reference documents")

    print("\nSample records:")
    for i, doc in enumerate(docs[:5]):
        print(f"{i+1}. {doc['spec_id']} - {doc['spec_name']} ({doc['org_identifier']})")

    print("\nOrganizations found:")
    orgs = set(doc['org_identifier'] for doc in docs if doc['org_identifier'])
    for org in sorted(orgs):
        count = sum(1 for doc in docs if doc['org_identifier'] == org)
        print(f"- {org}: {count} standards")

if __name__ == "__main__":
    main()
