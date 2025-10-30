import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { nextLetterRevision } from '@/lib/revision'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; planType: string }> }
) {
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

    const currentRes = await pool.query(
      `SELECT * FROM public.assets
       WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
       ORDER BY created_at DESC LIMIT 1`,
      [projectId, planType]
    )
    if (currentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    const cur = currentRes.rows[0]

    // If any approved baseline exists for this asset_uid, block draft commit
    const baseCheck = await pool.query(
      `SELECT 1 FROM public.assets WHERE asset_uid = $1 AND approval_state = 'approved' AND NOT is_deleted LIMIT 1`,
      [cur.asset_uid]
    )
    if (baseCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Approved baseline exists. Use submit-for-approval.' }, { status: 409 })
    }

    // Compute next letter revision (uppercase, AA after Z)
    // Treat missing current revision as 'A' baseline so first commit bumps to 'B'
    const currentRev = (cur.revision_code as string) || 'A'
    const nextRev = nextLetterRevision(currentRev)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      // Flip current head off first to satisfy UNIQUE (asset_uid) WHERE is_current constraint
      await client.query('UPDATE public.assets SET is_current=false, updated_at=NOW(), updated_by=$1 WHERE id=$2', [(session.user as any).id, cur.id])
      const newIdemKey = (cur.idempotency_key ? `${cur.idempotency_key}:rev:${nextRev}` : null)
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
        (cur.version || 1) + 1,
        cur.id,
        cur.type,
        cur.subtype,
        cur.name,
        cur.organization_id,
        cur.project_id,
        cur.document_number,
        nextRev,
        cur.path_key,
        'draft',
        'not_required',
        cur.classification,
        newIdemKey,
        cur.metadata,
        cur.content
      ]
    )
      await client.query('COMMIT')
      return NextResponse.json({ id: ins.rows[0].id, revision_code: nextRev })
    } catch (e) {
      try { await client.query('ROLLBACK') } catch {}
      console.error('Error committing plan revision:', e)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    } finally {
      try { client.release() } catch {}
    }
  } catch (error) {
    console.error('Error committing plan document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
