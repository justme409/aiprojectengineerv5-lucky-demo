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

    // Get hold/witness register from view
    const result = await pool.query(`
      SELECT * FROM public.hold_witness_register
      WHERE project_id = $1
      ORDER BY sla_due_at ASC
    `, [projectId])

    return NextResponse.json({ inspection_points: result.rows })
  } catch (error) {
    console.error('Error fetching hold/witness register:', error)
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
    const { action, inspectionPointId } = body

    if (action === 'notify') {
      // Notify witness
      await pool.query(`
        UPDATE public.assets
        SET content = jsonb_set(content, '{notified_at}', $1::jsonb),
            updated_at = now(), updated_by = $2
        WHERE id = $3
      `, [JSON.stringify(new Date().toISOString()), (session.user as any).id, inspectionPointId])

      return NextResponse.json({ message: 'Witness notified' })
    } else if (action === 'release') {
      // Release hold point
      await pool.query(`
        UPDATE public.assets
        SET content = jsonb_set(content, '{released_at}', $1::jsonb),
            status = 'approved',
            updated_at = now(), updated_by = $2
        WHERE id = $3
      `, [JSON.stringify(new Date().toISOString()), (session.user as any).id, inspectionPointId])

      return NextResponse.json({ message: 'Hold point released' })
    } else if (action === 'reject') {
      // Reject hold point
      await pool.query(`
        UPDATE public.assets
        SET status = 'rejected',
            updated_at = now(), updated_by = $1
        WHERE id = $2
      `, [(session.user as any).id, inspectionPointId])

      return NextResponse.json({ message: 'Hold point rejected' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing hold/witness action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}