import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get ITP register from view
    const result = await pool.query(`
      SELECT * FROM public.itp_register
      WHERE project_id = $1
      ORDER BY itp_asset_id
    `, [projectId])

    return NextResponse.json({ data: result.rows })
  } catch (error) {
    console.error('Error fetching ITP register:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}