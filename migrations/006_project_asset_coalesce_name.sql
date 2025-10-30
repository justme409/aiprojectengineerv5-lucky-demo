-- 006_project_asset_coalesce_name.sql
-- Ensure project asset insert succeeds when projects.name is NULL by coalescing to a placeholder

CREATE OR REPLACE FUNCTION public.create_project_asset_from_projects() RETURNS trigger AS $fn$
BEGIN
  BEGIN
    INSERT INTO public.assets (
      id, asset_uid, version, is_current,
      type, name, organization_id, project_id,
      status, classification, metadata, content, created_at, created_by
    ) VALUES (
      NEW.id, NEW.id, 1, true,
      'project', COALESCE(NEW.name, concat('Project ', left(NEW.id::text, 8))), NEW.organization_id, NULL,
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


