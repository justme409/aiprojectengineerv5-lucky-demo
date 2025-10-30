#!/usr/bin/env python3
import psycopg2
import sys

def debug_projects():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5555",
            database="projectpro",
            user="postgres",
            password="password"
        )

        cursor = conn.cursor()

        # Test the exact query used by the API
        user_id = "22b46dd2-8c34-4a0c-8966-e22063a6e9cd"  # auth.users id

        print("=== TESTING API QUERY ===")
        print(f"User ID: {user_id}")

        query = """
        SELECT p.*, o.name as organization_name
        FROM public.projects p
        JOIN public.organizations o ON o.id = p.organization_id
        JOIN public.organization_users ou ON ou.organization_id = p.organization_id AND ou.user_id = %s
        ORDER BY p.created_at DESC
        """

        cursor.execute(query, (user_id,))
        projects = cursor.fetchall()

        print(f"Found {len(projects)} projects:")
        for project in projects:
            print(f"  ID: {project[0]}, Name: {project[1]}, Org: {project[7]}")

        # Check organization_users entry
        print("\n=== ORGANIZATION_USERS CHECK ===")
        cursor.execute("SELECT * FROM public.organization_users WHERE user_id = %s;", (user_id,))
        org_users = cursor.fetchall()
        for org_user in org_users:
            print(f"  Org: {org_user[1]}, User: {org_user[2]}, Role: {org_user[3]}")

        # Check project_members entry
        print("\n=== PROJECT_MEMBERS CHECK ===")
        cursor.execute("SELECT * FROM public.project_members WHERE user_id = %s;", (user_id,))
        members = cursor.fetchall()
        for member in members:
            print(f"  Project: {member[1]}, User: {member[2]}, Permissions: {member[3]}")

        # Check the specific project
        project_id = "c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f"
        print(f"\n=== SPECIFIC PROJECT {project_id} ===")
        cursor.execute("SELECT * FROM public.projects WHERE id = %s;", (project_id,))
        project = cursor.fetchone()
        if project:
            print(f"  Project exists: {project}")
        else:
            print("  Project not found!")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    debug_projects()
