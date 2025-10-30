import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; planType: string }> }
) {
  const client = await pool.connect()
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, planType } = await params

    // Access check via org membership OR project membership
    const userId = (session.user as any).id
    const orgAccess = await pool.query(
      `SELECT 1 FROM public.projects p
       JOIN public.organization_users ou ON ou.organization_id = p.organization_id
       WHERE p.id = $1 AND ou.user_id = $2`,
      [projectId, userId]
    )
    if (orgAccess.rows.length === 0) {
      const projAccess = await pool.query(
        `SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2`,
        [projectId, userId]
      )
      if (projAccess.rows.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get current head
    const curRes = await pool.query(
      `SELECT * FROM public.assets
       WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
       ORDER BY created_at DESC LIMIT 1`,
      [projectId, planType]
    )
    if (curRes.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    const cur = curRes.rows[0]

    // Decide what revision_code to set on submission (do NOT switch to numeric yet)
    // - If there is an approved baseline, keep the last approved numeric on the in_review version
    // - Otherwise, keep the current (likely letter) revision as-is
    const approved = await pool.query(
      `SELECT revision_code FROM public.assets WHERE asset_uid = $1 AND approval_state = 'approved' AND NOT is_deleted ORDER BY version DESC LIMIT 1`,
      [cur.asset_uid]
    )
    const revToSet: string | null = approved.rows.length > 0
      ? (approved.rows[0].revision_code as string | null)
      : (cur.revision_code as string | null)

    await client.query('BEGIN')
    // Flip current head off first to satisfy UNIQUE (asset_uid) WHERE is_current constraint
    await client.query('UPDATE public.assets SET is_current=false, updated_at=NOW(), updated_by=$1 WHERE id=$2', [(session.user as any).id, cur.id])
    const newVersion = (cur.version || 1) + 1
    const newIdemKey = cur.idempotency_key
      ? `${cur.idempotency_key}:sub:v${newVersion}`
      : `plan-submit:${projectId}:${planType}:v${newVersion}`
    const ins = await client.query(
      `INSERT INTO public.assets (
         id, asset_uid, version, is_current, supersedes_asset_id, type, subtype, name, organization_id, project_id,
         document_number, revision_code, path_key, status, approval_state, classification, idempotency_key, metadata, content
       ) VALUES (
         gen_random_uuid(), $1, $2, true, $3, $4, $5, $6, $7, $8,
         $9, $10, $11, $12, $13, $14, $15, $16, $17
       ) RETURNING id`,
      [
        cur.asset_uid,
        newVersion,
        cur.id,
        cur.type,
        cur.subtype,
        cur.name,
        cur.organization_id,
        cur.project_id,
        cur.document_number,
        revToSet,
        cur.path_key,
        'in_review',
        'pending_review',
        cur.classification,
        newIdemKey,
        cur.metadata,
        cur.content
      ]
    )
    const newAssetId = ins.rows[0].id as string

    // Create a minimal approval_workflow asset so it appears in client portal
    try {
      await upsertAssetsAndEdges({
        asset: {
          type: 'approval_workflow',
          name: `${String(planType).toUpperCase()} Plan Approval`,
          project_id: projectId,
          content: {
            workflow_definition: { steps: [{ step_number: 1, name: 'Approval', approvers: [], approval_type: 'any' }] },
            target_asset_id: newAssetId,
            status: 'pending',
            current_step: 0,
            requested_by: (session.user as any)?.email || (session.user as any)?.id || 'system',
            requested_at: new Date().toISOString(),
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium'
          },
          status: 'pending'
        },
        edges: [],
        idempotency_key: `approval_workflow:plan:${projectId}:${planType}:v${newVersion}`,
        audit_context: { action: 'submit_plan_for_approval', user_id: (session.user as any).id }
      }, (session.user as any).id)
    } catch (e) {
      // Non-fatal if workflow creation fails
      console.warn('Failed to create approval workflow for plan:', e)
    }

    await client.query('COMMIT')
    return NextResponse.json({ id: newAssetId, revision_code: revToSet, status: 'in_review' })
  } catch (error) {
    try { await pool.query('ROLLBACK') } catch {}
    console.error('Error submitting plan for approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
