-- 006_drop_redundant_tables.sql
-- Drop tables that are redundant with Neo4j graph backend
-- Created: 2025-10-31
-- Reason: Moving to agent-first architecture with Neo4j as primary data store

BEGIN;

-- Drop tables that will be replaced by Neo4j nodes/relationships
-- These tables are no longer needed as data will live in the graph

-- 1. Processing runs - Agent metadata will be in Neo4j
DROP TABLE IF EXISTS public.processing_runs CASCADE;

-- 2. Asset embeddings - Moving to dedicated vector DB or Neo4j vector
DROP TABLE IF EXISTS public.asset_embeddings CASCADE;

-- 3. Correspondence threads - Email threading better handled in Neo4j relationships
DROP TABLE IF EXISTS public.correspondence_threads CASCADE;

-- 4. Retention policies - Governance can be Neo4j node properties
DROP TABLE IF EXISTS public.retention_policies CASCADE;

-- 5. Legal holds - Governance can be Neo4j node properties
DROP TABLE IF EXISTS public.legal_holds CASCADE;

-- Note: Keeping the following tables for gradual migration:
-- - public.assets (hybrid approach, ~10% use cases)
-- - public.asset_edges (will migrate to Neo4j gradually)
-- - public.documents (keeping for now, will migrate later)
-- - public.projects (core metadata)
-- - public.project_members (access control)
-- - auth.users (authentication)
-- - public.organizations (multi-tenancy)

COMMIT;

-- Verification queries (commented out, run manually if needed)
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

