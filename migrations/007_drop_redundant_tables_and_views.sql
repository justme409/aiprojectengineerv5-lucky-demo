-- 007_drop_redundant_tables_and_views.sql
-- Drop redundant tables and views that duplicate assets table functionality
-- Created: 2025-10-31
-- Reason: Consolidating all domain data into assets table with Neo4j migration

BEGIN;

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS public.work_lot_register CASCADE;
DROP VIEW IF EXISTS public.hold_witness_register CASCADE;
DROP VIEW IF EXISTS public.identified_records_register CASCADE;
DROP VIEW IF EXISTS public.itp_register CASCADE;
DROP VIEW IF EXISTS public.asset_history CASCADE;
DROP VIEW IF EXISTS public.asset_heads CASCADE;

-- Drop redundant tables
DROP TABLE IF EXISTS public.lots CASCADE;
DROP TABLE IF EXISTS public.schedule_items CASCADE;

-- Note: All lot data should be in assets table with type='lot'
-- Note: All schedule data should be in assets table with type='schedule_item' or similar
-- Note: Views can be recreated later if needed, but should query assets table directly

COMMIT;

-- Verification query (run manually if needed)
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT viewname FROM pg_views WHERE schemaname = 'public' ORDER BY viewname;

