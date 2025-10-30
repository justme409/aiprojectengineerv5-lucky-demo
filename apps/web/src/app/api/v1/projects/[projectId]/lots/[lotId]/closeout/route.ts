import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; lotId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, lotId } = await params

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get lot closeout data from work_lot_register view
    const result = await pool.query(`
      SELECT * FROM public.work_lot_register
      WHERE lot_asset_id = $1 AND project_id = $2
    `, [lotId, projectId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    const lotData = result.rows[0]

    // Check if lot can be closed
    const canClose = lotData.inspection_points.every((ip: any) =>
      ip.approval_state === 'approved' && ip.released_at
    )

    return NextResponse.json({
      lot: lotData,
      can_close: canClose,
      blocking_items: canClose ? [] : lotData.inspection_points.filter((ip: any) =>
        ip.approval_state !== 'approved' || !ip.released_at
      )
    })
  } catch (error) {
    console.error('Error fetching lot closeout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; lotId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, lotId } = await params
    const body = await request.json()
    const { action } = body

    if (action === 'generate_pack') {
      // Generate lot closeout pack
      const packData = {
        lot_id: lotId,
        project_id: projectId,
        generated_at: new Date().toISOString(),
        generated_by: (session.user as any).id,
        documents: [
          'conformance_statement.pdf',
          'test_results.pdf',
          'inspection_reports.pdf'
        ]
      }

      return NextResponse.json({
        message: 'Lot closeout pack generated',
        pack: packData
      })
    } else if (action === 'close_lot') {
      // Close the lot
      await pool.query(`
        UPDATE public.assets
        SET status = 'closed', updated_at = now(), updated_by = $1
        WHERE id = $2
      `, [(session.user as any).id, lotId])

      return NextResponse.json({ message: 'Lot closed successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing lot closeout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}