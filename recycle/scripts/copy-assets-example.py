#!/usr/bin/env python3
"""
Example script showing how to copy the assets table from one database to another.
This demonstrates the table_copy_tool.py functionality.
"""

from agents_v9.tools.table_copy_tool import copy_assets_table_to_another_db, copy_table_between_databases

def example_copy_assets():
    """Copy assets table to another database"""

    # Example 1: Copy all assets to another database
    success = copy_assets_table_to_another_db(
        dest_host="localhost",
        dest_port="5432",
        dest_database="projectpro_backup",
        dest_user="postgres",
        dest_password="your_dest_password"
    )

    if success:
        print("✅ Successfully copied all assets table")
    else:
        print("❌ Failed to copy assets table")

    # Example 2: Copy assets for specific project only
    success = copy_assets_table_to_another_db(
        dest_host="localhost",
        dest_port="5432",
        dest_database="projectpro_backup",
        dest_user="postgres",
        dest_password="your_dest_password",
        project_id="your-project-id-here"
    )

    if success:
        print("✅ Successfully copied assets for specific project")
    else:
        print("❌ Failed to copy assets for specific project")

    # Example 3: Copy any table between databases (more flexible)
    success = copy_table_between_databases(
        source_host="127.0.0.1",
        source_port="6543",
        source_database="postgres",
        source_user="postgres.projectpro",
        source_password="7c9cc7162a66bf353e240e15016ff7b70e3e5d09397bf62bbde8c11f239e3f30",
        dest_host="localhost",
        dest_port="5432",
        dest_database="projectpro_backup",
        dest_user="postgres",
        dest_password="your_dest_password",
        table_name="projects",
        source_schema="public",
        dest_schema="public"
    )

    if success:
        print("✅ Successfully copied projects table")
    else:
        print("❌ Failed to copy projects table")

if __name__ == "__main__":
    example_copy_assets()
