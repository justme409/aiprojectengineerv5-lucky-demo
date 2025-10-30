#!/usr/bin/env python3
import psycopg2
import sys

def associate_project_with_user():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5555",
            database="projectpro",
            user="postgres",
            password="password"
        )

        cursor = conn.cursor()

        project_id = "c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f"

        # Get project details
        cursor.execute("SELECT id, name, created_by_user_id, organization_id FROM public.projects WHERE id = %s;", (project_id,))
        project = cursor.fetchone()

        if not project:
            print(f"Project {project_id} not found!")
            return

        print(f"Project found: {project}")

        # Check if user is already a member of this project
        cursor.execute("SELECT * FROM public.project_members WHERE project_id = %s AND user_id = %s;", (project_id, project[2]))
        existing_member = cursor.fetchone()

        if existing_member:
            print(f"User {project[2]} is already a member of project {project_id}")
        else:
            print(f"Adding user {project[2]} as a member of project {project_id}")

            # Add user as project member
            cursor.execute("""
                INSERT INTO public.project_members (id, project_id, user_id, role_id, permissions, abac_attributes)
                VALUES (gen_random_uuid(), %s, %s, NULL, ARRAY['read', 'write', 'admin'], '{}'::jsonb);
            """, (project_id, project[2]))

            print("User successfully added as project member!")

        # Verify the association
        cursor.execute("SELECT project_id, user_id, permissions FROM public.project_members WHERE project_id = %s;", (project_id,))
        members = cursor.fetchall()

        print("\nCurrent project members:")
        for member in members:
            print(f"  Project: {member[0]}, User: {member[1]}, Permissions: {member[2]}")

        conn.commit()
        cursor.close()
        conn.close()

        print("\n✅ Project association completed successfully!")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    associate_project_with_user()
