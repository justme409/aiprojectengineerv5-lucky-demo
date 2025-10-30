#!/usr/bin/env python3
"""
Backup script for QSE documents from the assets table.

This script exports all QSE documents (assets with metadata->>'category' = 'qse')
to multiple formats for backup purposes.
"""

import psycopg2
import psycopg2.extras
import json
import csv
import os
from datetime import datetime
from pathlib import Path


def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(
        host="127.0.0.1",
        port="5555",
        database="projectpro",
        user="postgres",
        password="password"
    )


def get_qse_documents():
    """Fetch all QSE documents from the database."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    id,
                    asset_uid,
                    version,
                    is_current,
                    type,
                    name,
                    project_id,
                    document_number,
                    revision_code,
                    metadata,
                    content,
                    created_at,
                    updated_at
                FROM assets
                WHERE metadata->>'category' = 'qse'
                ORDER BY document_number, version
            """)
            return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def export_to_json(documents, output_dir):
    """Export QSE documents to JSON format."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"qse_docs_backup_{timestamp}.json"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(documents, f, indent=2, default=str, ensure_ascii=False)

    print(f"Exported {len(documents)} QSE documents to {filepath}")
    return filepath


def export_to_csv(documents, output_dir):
    """Export QSE documents to CSV format."""
    if not documents:
        print("No documents to export")
        return None

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"qse_docs_backup_{timestamp}.csv"
    filepath = os.path.join(output_dir, filename)

    # Get all possible keys for CSV headers
    all_keys = set()
    for doc in documents:
        all_keys.update(doc.keys())

    # Flatten nested fields for CSV
    flattened_docs = []
    for doc in documents:
        flat_doc = {}
        for key, value in doc.items():
            if isinstance(value, dict):
                # Flatten metadata and content
                for sub_key, sub_value in value.items():
                    flat_doc[f"{key}_{sub_key}"] = json.dumps(sub_value) if isinstance(sub_value, (dict, list)) else str(sub_value)
            else:
                flat_doc[key] = str(value) if value is not None else ''
        flattened_docs.append(flat_doc)

    # Write CSV
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        if flattened_docs:
            writer = csv.DictWriter(f, fieldnames=sorted(flattened_docs[0].keys()))
            writer.writeheader()
            writer.writerows(flattened_docs)

    print(f"Exported {len(documents)} QSE documents to {filepath}")
    return filepath


def export_to_sql_dump(documents, output_dir):
    """Export QSE documents to SQL INSERT statements."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"qse_docs_backup_{timestamp}.sql"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("-- QSE Documents Backup\n")
        f.write(f"-- Generated on {datetime.now().isoformat()}\n")
        f.write(f"-- Total documents: {len(documents)}\n\n")

        for doc in documents:
            # Create INSERT statement
            columns = []
            values = []

            for key, value in doc.items():
                if value is not None:
                    columns.append(key)
                    if isinstance(value, dict):
                        escaped_value = json.dumps(value).replace("'", "''")
                        values.append(f"'{escaped_value}'::jsonb")
                    elif isinstance(value, str):
                        escaped_value = value.replace("'", "''")
                        values.append(f"'{escaped_value}'")
                    else:
                        values.append(str(value))

            if columns:
                f.write("INSERT INTO assets (")
                f.write(", ".join(columns))
                f.write(") VALUES (")
                f.write(", ".join(values))
                f.write(");\n")

    print(f"Exported {len(documents)} QSE documents to {filepath}")
    return filepath


def create_backup_summary(documents, output_dir, files_created):
    """Create a backup summary file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    summary_file = os.path.join(output_dir, f"qse_backup_summary_{timestamp}.txt")

    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("QSE Documents Backup Summary\n")
        f.write("=" * 40 + "\n\n")
        f.write(f"Backup created: {datetime.now().isoformat()}\n")
        f.write(f"Total QSE documents: {len(documents)}\n\n")

        if documents:
            f.write("Document types found:\n")
            types = {}
            for doc in documents:
                doc_type = doc.get('type', 'unknown')
                types[doc_type] = types.get(doc_type, 0) + 1

            for doc_type, count in sorted(types.items()):
                f.write(f"  - {doc_type}: {count}\n")

            f.write("\nDocument numbers:\n")
            for doc in sorted(documents, key=lambda x: x.get('document_number', '')):
                doc_num = doc.get('document_number', 'N/A')
                title = doc.get('name', 'N/A')
                f.write(f"  - {doc_num}: {title}\n")

        f.write("\nFiles created:\n")
        for file_path in files_created:
            f.write(f"  - {os.path.basename(file_path)}\n")

    print(f"Backup summary created: {summary_file}")
    return summary_file


def main():
    """Main backup function."""
    print("Starting QSE documents backup...")

    # Create backups directory
    backup_dir = Path("backups")
    backup_dir.mkdir(exist_ok=True)

    # Create timestamped subdirectory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = backup_dir / f"qse_backup_{timestamp}"
    output_dir.mkdir(exist_ok=True)

    try:
        # Get QSE documents
        documents = get_qse_documents()
        print(f"Found {len(documents)} QSE documents to backup")

        # Export to different formats
        files_created = []

        json_file = export_to_json(documents, str(output_dir))
        files_created.append(json_file)

        csv_file = export_to_csv(documents, str(output_dir))
        if csv_file:
            files_created.append(csv_file)

        sql_file = export_to_sql_dump(documents, str(output_dir))
        files_created.append(sql_file)

        # Create summary
        summary_file = create_backup_summary(documents, str(output_dir), files_created)
        files_created.append(summary_file)

        print("\nBackup completed successfully!")
        print(f"Backup location: {output_dir.absolute()}")
        print(f"Files created: {len(files_created)}")

    except Exception as e:
        print(f"Error during backup: {e}")
        raise


if __name__ == "__main__":
    main()
