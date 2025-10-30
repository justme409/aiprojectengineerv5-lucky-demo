#!/usr/bin/env python3
import psycopg2
import sys

def query_database():
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host="localhost",
            port="5555",
            database="projectpro",
            user="postgres",
            password="password"
        )

        cursor = conn.cursor()

        # Check users table
        print("=== USERS TABLE ===")
        cursor.execute("SELECT id, name, email FROM public.users LIMIT 10;")
        users = cursor.fetchall()
        if users:
            for user in users:
                print(f"ID: {user[0]}, Name: {user[1]}, Email: {user[2]}")
        else:
            print("No users found")

        # Check projects table
        print("\n=== PROJECTS TABLE ===")
        cursor.execute("SELECT id, name, created_by_user_id, organization_id FROM public.projects LIMIT 10;")
        projects = cursor.fetchall()
        if projects:
            for project in projects:
                print(f"ID: {project[0]}, Name: {project[1]}, Created by: {project[2]}, Org: {project[3]}")
        else:
            print("No projects found")

        # Check the specific project
        print("\n=== SPECIFIC PROJECT c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f ===")
        cursor.execute("SELECT id, name, created_by_user_id, organization_id FROM public.projects WHERE id = %s;", ("c9e9dcfb-62b9-466d-b537-3a90dd0e9f6f",))
        project = cursor.fetchone()
        if project:
            print(f"Found project: {project}")
        else:
            print("Project not found")

        # Check project_members table
        print("\n=== PROJECT MEMBERS TABLE ===")
        cursor.execute("SELECT project_id, user_id, role_id FROM public.project_members LIMIT 10;")
        members = cursor.fetchall()
        if members:
            for member in members:
                print(f"Project: {member[0]}, User: {member[1]}, Role: {member[2]}")
        else:
            print("No project members found")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    query_database()
