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

    // Get records handover data from view
    const result = await pool.query(`
      SELECT * FROM public.identified_records_register
      WHERE project_id = $1
      ORDER BY asset_id
    `, [projectId])

    return NextResponse.json({ records_handover: result.rows })
  } catch (error) {
    console.error('Error fetching records handover:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()
    const { recordId, action } = body

    if (action === 'mark_delivered') {
      // Mark record as delivered
      await pool.query(`
        UPDATE public.assets
        SET content = jsonb_set(content, '{delivered_at}', $1::jsonb),
            updated_at = now(), updated_by = $2
        WHERE id = $3
      `, [JSON.stringify(new Date().toISOString()), (session.user as any).id, recordId])

      return NextResponse.json({ message: 'Record marked as delivered' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing records handover:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}