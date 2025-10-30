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
    const { searchParams } = new URL(request.url)
    const view = (searchParams.get('view') || 'wbs').toLowerCase()

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get lots from work_lot_register view
    // Order by WBS or LBS-related fields depending on requested view
    const orderClause = view === 'lbs' ? 'location_path, lot_number' : 'lot_number'
    const result = await pool.query(
      `SELECT * FROM public.work_lot_register
       WHERE project_id = $1
       ORDER BY ${orderClause}`,
      [projectId]
    )

    return NextResponse.json({ lots: result.rows })
  } catch (error) {
    console.error('Error fetching quality lots:', error)
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
    const { action } = body

    if (action === 'plan_sampling') {
      // Plan sampling for lots
      const samplingPlan = {
        lots: body.lotIds,
        sampling_method: 'annex_l',
        planned_samples: body.sampleCount,
        generated_at: new Date().toISOString()
      }

      return NextResponse.json({
        message: 'Sampling planned',
        plan: samplingPlan
      })
    } else if (action === 'close_lot') {
      // Close lot
      await pool.query(`
        UPDATE public.assets
        SET status = 'closed', updated_at = now(), updated_by = $1
        WHERE id = $2
      `, [(session.user as any).id, body.lotId])

      return NextResponse.json({ message: 'Lot closed' })
    } else if (action === 'apply_indicative_conformance') {
      // Apply indicative conformance
      await pool.query(`
        UPDATE public.assets
        SET content = jsonb_set(content, '{indicative_conformance}', $1::jsonb),
            updated_at = now(), updated_by = $2
        WHERE id = $3
      `, [JSON.stringify(body.conformanceData), (session.user as any).id, body.lotId])

      return NextResponse.json({ message: 'Indicative conformance applied' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing quality lots action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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
    const { lotId, status } = body

    await pool.query(`
      UPDATE public.assets
      SET status = $1, updated_at = now(), updated_by = $2
      WHERE id = $3 AND project_id = $4
    `, [status, (session.user as any).id, lotId, projectId])

    return NextResponse.json({ message: 'Lot updated' })
  } catch (error) {
    console.error('Error updating lot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}