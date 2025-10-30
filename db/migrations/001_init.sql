-- 001_init.sql
-- Additive, idempotent migration establishing asset-centric schema and helpers

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Schemas
CREATE SCHEMA IF NOT EXISTS auth;

-- Minimal auth.users table to satisfy FKs (can be a view for external auth providers)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='auth' AND table_name='users'
  ) THEN
    CREATE TABLE auth.users (
      id uuid PRIMARY KEY,
      email text UNIQUE,
      password_hash text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END$$;

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY,
  name text,
  domain text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations USING btree(name);

-- Ensure at least one organization exists for seed data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.organizations) THEN
    INSERT INTO public.organizations (id, name, domain, metadata)
    VALUES (gen_random_uuid(), 'Default Organization', NULL, '{}'::jsonb);
  END IF;
END$$;

-- Roles, Permissions, Mappings
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY,
  code text UNIQUE,
  name text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_code ON public.roles(code);

CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY,
  code text UNIQUE,
  name text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_permissions_code ON public.permissions(code);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY,
  role_id uuid REFERENCES public.roles(id),
  permission_id uuid REFERENCES public.permissions(id),
  UNIQUE(role_id, permission_id)
);

-- Organization users
CREATE TABLE IF NOT EXISTS public.organization_users (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  user_id uuid REFERENCES auth.users(id),
  role_id uuid REFERENCES public.roles(id),
  attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_users_org ON public.organization_users(organization_id);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY,
  name text,
  description text,
  location text,
  client_name text,
  created_by_user_id uuid,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  organization_id uuid REFERENCES public.organizations(id),
  settings jsonb DEFAULT '{}'::jsonb
);

-- Project members
CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id),
  user_id uuid REFERENCES auth.users(id),
  role_id uuid REFERENCES public.roles(id),
  permissions text[],
  abac_attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_abac ON public.project_members USING GIN (abac_attributes);

-- Assets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='assets'
  ) THEN
    CREATE TABLE public.assets (
      id uuid PRIMARY KEY,
      asset_uid uuid NOT NULL,
      version int NOT NULL,
      is_current boolean DEFAULT true,
      supersedes_asset_id uuid,
      version_label text,
      effective_from timestamptz,
      effective_to timestamptz,
      type text NOT NULL,
      subtype text,
      name text NOT NULL,
      organization_id uuid NOT NULL REFERENCES public.organizations(id),
      project_id uuid REFERENCES public.projects(id),
      parent_asset_id uuid REFERENCES public.assets(id),
      document_number text,
      revision_code text,
      path_key text,
      status text DEFAULT 'draft',
      approval_state text DEFAULT 'not_required',
      classification text DEFAULT 'internal',
      idempotency_key text,
      metadata jsonb DEFAULT '{}'::jsonb,
      content jsonb DEFAULT '{}'::jsonb,
      due_sla_at timestamptz,
      scheduled_at timestamptz,
      requested_for_at timestamptz,
      created_at timestamptz DEFAULT now(),
      created_by uuid,
      updated_at timestamptz DEFAULT now(),
      updated_by uuid,
      is_deleted boolean DEFAULT false,
      CONSTRAINT uq_asset_uid_version UNIQUE (asset_uid, version)
    );
    -- Add indexes and constraints
    CREATE UNIQUE INDEX IF NOT EXISTS uq_assets_idem ON public.assets(project_id, type, idempotency_key) WHERE idempotency_key IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS uq_assets_current_head ON public.assets(asset_uid) WHERE is_current;
    CREATE UNIQUE INDEX IF NOT EXISTS uq_assets_wbs_lbs_path ON public.assets(project_id, path_key) WHERE type IN ('wbs_node','lbs_node');
    CREATE UNIQUE INDEX IF NOT EXISTS uq_assets_doc_rev ON public.assets(document_number, revision_code) WHERE type IN ('document','spec','drawing');
    CREATE INDEX IF NOT EXISTS idx_assets_org ON public.assets(organization_id);
    CREATE INDEX IF NOT EXISTS idx_assets_project ON public.assets(project_id);
    CREATE INDEX IF NOT EXISTS idx_assets_type_subtype ON public.assets(type, subtype);
    CREATE INDEX IF NOT EXISTS idx_assets_status_approval ON public.assets(status, approval_state);
    CREATE INDEX IF NOT EXISTS idx_assets_due_sla ON public.assets(due_sla_at) WHERE type IN ('inspection_request','inspection_point','test_request');
    CREATE INDEX IF NOT EXISTS idx_assets_scheduled ON public.assets(scheduled_at) WHERE type IN ('inspection_request','inspection_schedule');
    CREATE INDEX IF NOT EXISTS idx_assets_requested_for ON public.assets(requested_for_at) WHERE type IN ('inspection_request');
    CREATE INDEX IF NOT EXISTS idx_assets_metadata ON public.assets USING GIN (metadata);
    CREATE INDEX IF NOT EXISTS idx_assets_content ON public.assets USING GIN (content);
    CREATE INDEX IF NOT EXISTS idx_assets_content_ip ON public.assets USING GIN (content) WHERE type='inspection_point';
    CREATE INDEX IF NOT EXISTS idx_assets_content_tr ON public.assets USING GIN (content) WHERE type='test_result';
    -- Type CHECK constraint
    ALTER TABLE public.assets
      ADD CONSTRAINT chk_assets_type_valid
      CHECK (type IN ('project','document','drawing','spec','correspondence','email','memo','meeting_minute','rfi','material','mix_design','msds','calibration_certificate','batch_ticket','plan','wbs_node','lbs_node','itp_template','itp_document','lot','inspection_point','inspection_request','inspection_signature','inspection_schedule','test_request','sample','lab','test_method','test_result','measurement','ncr','risk','hazard','control','requirement','standard','clause','policy','procedure','work_instruction','form','record','audit','audit_finding','capa','incident','task','decision','comment','user','role','organization','geo_feature','photo','embedding','processing_run','swms','jsa','permit','toolbox_talk','safety_walk','induction','approval_workflow','rule','retention_policy','legal_hold','compliance_pack','project_compliance_config','daily_diary','site_instruction','timesheet','roster','plant_prestart','maintenance_record','utilization_log'));
  END IF;
END$$;

-- Compute timestamp columns from content JSON (replaces non-immutable generated columns)
CREATE OR REPLACE FUNCTION public.compute_asset_timestamps() RETURNS trigger AS $fn$
BEGIN
  NEW.due_sla_at := NULLIF(NEW.content->>'sla_due_at','')::timestamptz;
  NEW.scheduled_at := NULLIF(NEW.content->>'scheduled_at','')::timestamptz;
  NEW.requested_for_at := NULLIF(NEW.content->>'requested_for','')::timestamptz;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_assets_compute_timestamps'
  ) THEN
    CREATE TRIGGER trg_assets_compute_timestamps
    BEFORE INSERT OR UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION public.compute_asset_timestamps();
  END IF;
END$$;

-- Asset Edges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='asset_edges'
  ) THEN
    CREATE TABLE public.asset_edges (
      id uuid PRIMARY KEY,
      from_asset_id uuid NOT NULL REFERENCES public.assets(id),
      to_asset_id uuid NOT NULL REFERENCES public.assets(id),
      edge_type text NOT NULL,
      properties jsonb DEFAULT '{}'::jsonb,
      idempotency_key text,
      created_at timestamptz DEFAULT now(),
      CONSTRAINT chk_edge_type CHECK (edge_type IN ('PARENT_OF','PART_OF','INSTANCE_OF','TEMPLATE_FOR','VERSION_OF','SUPERSEDES','ALIAS_OF','BELONGS_TO_PROJECT','LOCATED_IN_LBS','COVERS_WBS','APPLIES_TO','MAPPED_TO','RELATED_TO','GOVERNED_BY','IMPLEMENTS','EVIDENCES','VIOLATES','SATISFIES','CONSTRAINED_BY','APPROVED_BY','REVIEWED_BY','OWNED_BY','ASSIGNED_TO','REPORTED_BY','RESOLVED_BY','CLOSES','REFERENCES','CITES','QUOTES','SUMMARIZES','EXTRACTS','ANNOTATES','TAGS','DEPENDS_ON','BLOCKED_BY','REPLACES','DUPLICATES','CONTEXT_FOR','INPUT_TO','OUTPUT_OF','GENERATED_FROM'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS uq_edges_idem ON public.asset_edges(edge_type, idempotency_key) WHERE idempotency_key IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_edges_from ON public.asset_edges(from_asset_id);
    CREATE INDEX IF NOT EXISTS idx_edges_to ON public.asset_edges(to_asset_id);
    CREATE INDEX IF NOT EXISTS idx_edges_type ON public.asset_edges(edge_type);
    CREATE INDEX IF NOT EXISTS idx_edges_type_from ON public.asset_edges(edge_type, from_asset_id);
    CREATE INDEX IF NOT EXISTS idx_edges_type_to ON public.asset_edges(edge_type, to_asset_id);
    CREATE INDEX IF NOT EXISTS idx_edges_properties ON public.asset_edges USING GIN (properties);
  END IF;
END$$;

-- Documents side-table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id),
  asset_id uuid REFERENCES public.assets(id),
  blob_url text,
  storage_path text,
  file_name text,
  content_type text,
  size bigint,
  source_hash text,
  document_number text,
  revision_code text,
  transmittal_number text,
  revision_date timestamptz,
  doc_type text,
  distribution_list text[],
  distribution_matrix jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  processing_status text DEFAULT 'uploaded',
  raw_content text,
  structured_output jsonb DEFAULT '{}'::jsonb,
  llm_scope_output jsonb DEFAULT '{}'::jsonb,
  llm_summary jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  uploaded_by uuid
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_docs_src_hash ON public.documents(project_id, source_hash) WHERE source_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_docs_doc_rev ON public.documents(document_number, revision_code) WHERE document_number IS NOT NULL AND revision_code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_docs_transmittal ON public.documents(transmittal_number) WHERE transmittal_number IS NOT NULL;

-- Processing runs
CREATE TABLE IF NOT EXISTS public.processing_runs (
  id uuid PRIMARY KEY,
  run_uid uuid UNIQUE,
  project_id uuid REFERENCES public.projects(id),
  agent_id text,
  model text,
  model_version text,
  prompt_hash text,
  params jsonb DEFAULT '{}'::jsonb,
  retries int DEFAULT 0,
  latency_ms int,
  input_tokens int,
  output_tokens int,
  cost numeric(12,6),
  confidence numeric(3,2),
  validator_status text,
  reviewer_id uuid,
  thread_id text,
  run_id text,
  status text DEFAULT 'completed',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Asset embeddings
CREATE TABLE IF NOT EXISTS public.asset_embeddings (
  id uuid PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id),
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_asset_embeddings_vec ON public.asset_embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists=100);

-- Events and audit
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY,
  project_id uuid,
  source_table text,
  record_id uuid,
  event_type text,
  payload jsonb,
  occurred_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_project ON public.events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_time ON public.events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_source ON public.events(source_table);

CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY,
  project_id uuid,
  actor_user_id uuid,
  action text,
  resource_type text,
  resource_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_project ON public.audit_events(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON public.audit_events(created_at);

-- Governance side-tables
CREATE TABLE IF NOT EXISTS public.retention_policies (
  id uuid PRIMARY KEY,
  project_id uuid,
  asset_id uuid REFERENCES public.assets(id),
  policy_name text,
  classification text,
  retention_years int,
  legal_hold_override boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_holds (
  id uuid PRIMARY KEY,
  project_id uuid,
  asset_id uuid REFERENCES public.assets(id),
  hold_reason text,
  issued_by text,
  issued_at timestamptz,
  status text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Webhooks
CREATE TABLE IF NOT EXISTS public.webhooks_outbound (
  id uuid PRIMARY KEY,
  project_id uuid,
  target_url text,
  event_filter text,
  secret text,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email correspondence threading
CREATE TABLE IF NOT EXISTS public.correspondence_threads (
  id uuid PRIMARY KEY,
  project_id uuid,
  asset_id uuid REFERENCES public.assets(id),
  thread_key text,
  last_message_at timestamptz,
  participants text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, thread_key)
);
CREATE INDEX IF NOT EXISTS idx_corr_project_thread ON public.correspondence_threads(project_id, thread_key);
CREATE INDEX IF NOT EXISTS idx_corr_last_message ON public.correspondence_threads(last_message_at);

-- Project feature flags
CREATE TABLE IF NOT EXISTS public.project_feature_flags (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id),
  pack_asset_uid uuid,
  flags jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Helper Functions
-- set_assets_org_from_project
CREATE OR REPLACE FUNCTION public.set_assets_org_from_project() RETURNS trigger AS $fn$
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id FROM public.projects WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

-- ensure_belongs_to_project_edge
CREATE OR REPLACE FUNCTION public.ensure_belongs_to_project_edge() RETURNS trigger AS $fn$
DECLARE project_asset uuid;
DECLARE existing_edge uuid;
BEGIN
  IF NEW.project_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT id INTO project_asset FROM public.assets
    WHERE type='project' AND id = NEW.project_id AND is_current AND NOT is_deleted;
  IF project_asset IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT id INTO existing_edge FROM public.asset_edges
    WHERE from_asset_id = NEW.id AND edge_type='BELONGS_TO_PROJECT';
  IF existing_edge IS NULL THEN
    INSERT INTO public.asset_edges (id, from_asset_id, to_asset_id, edge_type, properties, idempotency_key)
      VALUES (gen_random_uuid(), NEW.id, project_asset, 'BELONGS_TO_PROJECT', '{}'::jsonb, concat('BELONGS_TO_PROJECT:', NEW.id::text));
  ELSE
    UPDATE public.asset_edges SET to_asset_id = project_asset WHERE id = existing_edge;
  END IF;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

-- prevent_parent_cycle
CREATE OR REPLACE FUNCTION public.prevent_parent_cycle() RETURNS trigger AS $fn$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.edge_type = 'PARENT_OF' THEN
      IF NEW.from_asset_id = NEW.to_asset_id THEN
        RAISE EXCEPTION 'PARENT_OF cannot be reflexive';
      END IF;
      IF EXISTS (
        SELECT 1 FROM public.asset_edges e
          WHERE e.edge_type='PARENT_OF'
            AND e.from_asset_id = NEW.to_asset_id
            AND e.to_asset_id = NEW.from_asset_id
      ) THEN
        RAISE EXCEPTION 'Cycle detected in PARENT_OF';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

-- project_flag_enabled
CREATE OR REPLACE FUNCTION public.project_flag_enabled(project_id uuid, flag text) RETURNS boolean AS $fn$
  SELECT COALESCE((SELECT (flags ->> flag)::boolean FROM public.project_feature_flags WHERE project_id = $1), false);
$fn$ LANGUAGE sql;

-- create_project_asset_from_projects
CREATE OR REPLACE FUNCTION public.create_project_asset_from_projects() RETURNS trigger AS $fn$
BEGIN
  BEGIN
    INSERT INTO public.assets (
      id, asset_uid, version, is_current,
      type, name, organization_id, project_id,
      status, classification, metadata, content, created_at, created_by
    ) VALUES (
      NEW.id, NEW.id, 1, true,
      'project', NEW.name, NEW.organization_id, NULL,
      COALESCE(NEW.status, 'draft'), 'internal', '{}'::jsonb,
      jsonb_build_object('settings', COALESCE(NEW.settings, '{}'::jsonb)),
      now(), NEW.created_by_user_id
    );
  EXCEPTION WHEN unique_violation THEN
    NULL;
  END;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_assets_set_org'
  ) THEN
    CREATE TRIGGER trg_assets_set_org
    BEFORE INSERT OR UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION public.set_assets_org_from_project();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_assets_belongs_to_project_edge'
  ) THEN
    CREATE TRIGGER trg_assets_belongs_to_project_edge
    AFTER INSERT OR UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION public.ensure_belongs_to_project_edge();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_asset_edges_acyclic_parent'
  ) THEN
    CREATE TRIGGER trg_asset_edges_acyclic_parent
    BEFORE INSERT OR UPDATE ON public.asset_edges
    FOR EACH ROW EXECUTE FUNCTION public.prevent_parent_cycle();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_projects_create_asset'
  ) THEN
    CREATE TRIGGER trg_projects_create_asset
    AFTER INSERT ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.create_project_asset_from_projects();
  END IF;
END$$;

-- Views
-- asset_heads
CREATE OR REPLACE VIEW public.asset_heads AS
SELECT * FROM public.assets WHERE is_current AND NOT is_deleted;

-- asset_history
CREATE OR REPLACE VIEW public.asset_history AS
SELECT asset_uid, id, version, supersedes_asset_id, is_current, created_at, status
FROM public.assets
ORDER BY asset_uid, version;

-- work_lot_register
CREATE OR REPLACE VIEW public.work_lot_register AS
WITH lot_assets AS (
  SELECT a.* FROM public.assets a
  WHERE a.type='lot' AND a.is_current AND NOT a.is_deleted
),
hp_wp AS (
  SELECT l.id AS lot_id,
         jsonb_agg(DISTINCT jsonb_build_object(
           'inspection_point_id', ip.id,
           'code', ip.content->>'code',
           'title', ip.content->>'title',
           'point_type', ip.content->>'point_type',
           'sla_due_at', ip.content->>'sla_due_at',
           'notified_at', ip.content->>'notified_at',
           'released_at', ip.content->>'released_at',
           'approval_state', ip.approval_state
         )) AS inspection_points
  FROM lot_assets l
  JOIN public.asset_edges e ON (e.edge_type IN ('BLOCKED_BY','REFERENCES') AND (e.from_asset_id = l.id OR e.to_asset_id = l.id))
  JOIN public.assets ip ON ip.id = (CASE WHEN e.from_asset_id = l.id THEN e.to_asset_id ELSE e.from_asset_id END)
  WHERE ip.type='inspection_point' AND ip.is_current AND NOT ip.is_deleted
  GROUP BY l.id
),
test_results AS (
  SELECT (tr.content->>'lot_asset_id')::uuid AS lot_id,
         jsonb_agg(tr.content) AS test_results
  FROM public.assets tr
  WHERE tr.type='test_result' AND tr.is_current AND NOT tr.is_deleted
    AND (tr.content->>'lot_asset_id') IS NOT NULL
  GROUP BY (tr.content->>'lot_asset_id')::uuid
)
SELECT l.project_id,
       l.organization_id,
       l.id AS lot_asset_id,
       l.asset_uid,
       l.version,
       l.name AS lot_name,
       (l.content->>'lot_number') AS lot_number,
       (l.content->>'status') AS lot_status,
       l.approval_state,
       (l.content->>'itp_document_asset_id') AS itp_document_asset_id,
       COALESCE(hp_wp.inspection_points, '[]'::jsonb) AS inspection_points,
       COALESCE(trs.test_results, '[]'::jsonb) AS test_results
FROM lot_assets l
LEFT JOIN hp_wp ON hp_wp.lot_id = l.id
LEFT JOIN test_results trs ON trs.lot_id = l.id;

-- hold_witness_register
CREATE OR REPLACE VIEW public.hold_witness_register AS
SELECT ip.project_id,
       ip.organization_id,
       ip.id AS inspection_point_id,
       ip.asset_uid,
       ip.version,
       ip.name,
       ip.approval_state,
       ip.content->>'point_type' AS point_type,
       ip.content->>'code' AS code,
       ip.content->>'title' AS title,
       ip.content->>'itp_item_ref' AS itp_item_ref,
       ip.content->>'jurisdiction_rule_ref' AS jurisdiction_rule_ref,
       ip.content->>'notified_at' AS notified_at,
       ip.content->>'released_at' AS released_at,
       ip.content->>'sla_due_at' AS sla_due_at
FROM public.assets ip
WHERE ip.type='inspection_point' AND ip.is_current AND NOT ip.is_deleted;

-- identified_records_register
CREATE OR REPLACE VIEW public.identified_records_register AS
SELECT a.organization_id,
       a.project_id,
       a.id AS asset_id,
       a.name,
       a.type,
       a.subtype,
       a.status,
       a.approval_state,
       a.content->'records_identified' AS records_identified
FROM public.assets a
WHERE a.type IN ('plan','itp_document','itp_template') AND a.is_current AND NOT a.is_deleted;

-- itp_register
CREATE OR REPLACE VIEW public.itp_register AS
SELECT itp.organization_id,
       itp.project_id,
       itp.id AS itp_asset_id,
       itp.version,
       itp.approval_state,
       (SELECT jsonb_agg(jsonb_build_object('user_or_role', ap.to_asset_id, 'approved_at', ap.properties->>'approved_at'))
          FROM public.asset_edges ap
          WHERE ap.edge_type='APPROVED_BY' AND ap.from_asset_id=itp.id) AS approvals,
       itp.content->>'jurisdiction_coverage_status' AS jurisdiction_coverage_status,
       itp.content->>'required_points_present' AS required_points_present
FROM public.assets itp
WHERE itp.type IN ('itp_template','itp_document') AND itp.is_current AND NOT itp.is_deleted;


