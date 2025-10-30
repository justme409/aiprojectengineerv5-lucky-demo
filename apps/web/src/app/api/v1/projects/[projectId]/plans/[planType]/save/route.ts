import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

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
    const body = await req.json()
    const content = body?.html ? { html: body.html } : { body: body?.body ?? '' }

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

    // If current plan exists, update content in-place (do not version on save)
    const existing = await pool.query(
      `SELECT id FROM public.assets
       WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
       ORDER BY created_at DESC LIMIT 1`,
      [projectId, planType]
    )

    if (existing.rows.length > 0) {
      const assetId = existing.rows[0].id
      await pool.query('UPDATE public.assets SET content = $2, updated_at = NOW(), updated_by = $3 WHERE id = $1', [assetId, content, (session.user as any).id])
      return NextResponse.json({ id: assetId })
    }

    // Otherwise, create initial asset with revision_code 'A'
    const spec = {
      asset: {
        type: 'plan',
        subtype: planType,
        name: `${String(planType).toUpperCase()} Plan`,
        project_id: projectId,
        content,
        status: 'draft',
        revision_code: 'A',
        metadata: { plan_type: planType },
      },
      edges: [],
      idempotency_key: `plan:${projectId}:${planType}`,
      audit_context: { action: 'save_plan', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error saving plan document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


