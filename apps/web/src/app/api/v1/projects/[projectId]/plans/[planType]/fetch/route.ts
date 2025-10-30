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

    const result = await pool.query(
      `SELECT id, name, subtype, content, metadata, revision_code
       FROM public.assets
       WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
       ORDER BY created_at DESC LIMIT 1`,
      [projectId, planType]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const asset = result.rows[0]
    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error fetching plan document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



