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

    // Get latest processing run for project
    const result = await pool.query(`
      SELECT pr.*, COUNT(DISTINCT ae.from_asset_id) as assets_processed
      FROM public.processing_runs pr
      LEFT JOIN public.asset_edges ae ON ae.to_asset_id = pr.id::text
        AND ae.edge_type = 'OUTPUT_OF'
      WHERE pr.project_id = $1
      ORDER BY pr.started_at DESC
      LIMIT 1
    `, [projectId])

    if (result.rows.length === 0) {
      return NextResponse.json({
        status: 'idle',
        message: 'No processing runs found'
      })
    }

    const run = result.rows[0]
    return NextResponse.json({
      status: run.status,
      run_id: run.run_uid,
      started_at: run.started_at,
      ended_at: run.ended_at,
      assets_processed: parseInt(run.assets_processed) || 0,
      model: run.model,
      confidence: run.confidence
    })
  } catch (error) {
    console.error('Error fetching processing status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}