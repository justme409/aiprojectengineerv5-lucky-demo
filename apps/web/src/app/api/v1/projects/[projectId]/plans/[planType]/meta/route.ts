import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(
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

    const plan = await pool.query(
      `SELECT id, asset_uid, revision_code, approval_state, metadata FROM public.assets
       WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
       ORDER BY created_at DESC LIMIT 1`,
      [projectId, planType]
    )

    if (plan.rows.length === 0) {
      return NextResponse.json({
        revisionIdentifier: 'A',
        approverName: null,
        approvedAt: null
      })
    }

    const row = plan.rows[0]
    // Determine whether any approved baseline exists for this asset_uid
    let hasApprovedBaseline = false
    if (row.asset_uid) {
      const q = await pool.query(
        `SELECT 1 FROM public.assets WHERE asset_uid = $1 AND approval_state = 'approved' AND NOT is_deleted LIMIT 1`,
        [row.asset_uid]
      )
      hasApprovedBaseline = q.rows.length > 0
    }

    return NextResponse.json({
      revisionIdentifier: row.revision_code || 'A',
      approvalState: row.approval_state || 'not_required',
      hasApprovedBaseline,
      approverName: null,
      approvedAt: null
    })
  } catch (error) {
    console.error('Error fetching plan meta:', error)
    return NextResponse.json({
      revisionIdentifier: 'A',
      approvalState: 'not_required',
      hasApprovedBaseline: false,
      approverName: null,
      approvedAt: null
    })
  }
}


