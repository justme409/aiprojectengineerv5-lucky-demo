import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const reportType = searchParams.get('type')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    let reportData = {}

    switch (reportType) {
      case 'quality_dashboard':
        reportData = await generateQualityDashboard(projectId, dateFrom || undefined, dateTo || undefined)
        break
      case 'inspection_summary':
        reportData = await generateInspectionSummary(projectId, dateFrom || undefined, dateTo || undefined)
        break
      case 'lot_progress':
        reportData = await generateLotProgress(projectId)
        break
      case 'hse_incidents':
        reportData = await generateHSEIncidents(projectId, dateFrom || undefined, dateTo || undefined)
        break
      default:
        reportData = await generateProjectOverview(projectId)
    }

    return NextResponse.json({
      report_type: reportType || 'overview',
      generated_at: new Date().toISOString(),
      date_range: { from: dateFrom, to: dateTo },
      data: reportData
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateQualityDashboard(projectId: string, dateFrom?: string, dateTo?: string) {
  const dateFilter = dateFrom && dateTo ? `AND a.created_at BETWEEN '${dateFrom}' AND '${dateTo}'` : ''

  const [lotsResult, inspectionsResult, testsResult] = await Promise.all([
    pool.query(`
      SELECT COUNT(*) as total_lots,
             COUNT(*) FILTER (WHERE status = 'closed') as closed_lots
      FROM public.asset_heads
      WHERE project_id = $1 AND type = 'lot' ${dateFilter}
    `, [projectId]),

    pool.query(`
      SELECT COUNT(*) as total_inspections,
             COUNT(*) FILTER (WHERE status = 'approved') as approved_inspections
      FROM public.asset_heads
      WHERE project_id = $1 AND type = 'inspection_request' ${dateFilter}
    `, [projectId]),

    pool.query(`
      SELECT COUNT(*) as total_tests,
             COUNT(*) FILTER (WHERE status = 'passed') as passed_tests
      FROM public.asset_heads
      WHERE project_id = $1 AND type IN ('test_result', 'test_request') ${dateFilter}
    `, [projectId])
  ])

  return {
    lots: lotsResult.rows[0],
    inspections: inspectionsResult.rows[0],
    tests: testsResult.rows[0]
  }
}

async function generateInspectionSummary(projectId: string, dateFrom?: string, dateTo?: string) {
  const dateFilter = dateFrom && dateTo ? `AND a.created_at BETWEEN '${dateFrom}' AND '${dateTo}'` : ''

  const result = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE a.status = 'approved') as approved,
      COUNT(*) FILTER (WHERE a.status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE a.status = 'pending') as pending,
      AVG(EXTRACT(EPOCH FROM (a.updated_at - a.created_at))/86400) as avg_completion_days
    FROM public.asset_heads a
    WHERE a.project_id = $1 AND a.type = 'inspection_request' ${dateFilter}
  `, [projectId])

  return result.rows[0]
}

async function generateLotProgress(projectId: string) {
  const result = await pool.query(`
    SELECT
      COUNT(*) as total_lots,
      COUNT(*) FILTER (WHERE status = 'active') as active_lots,
      COUNT(*) FILTER (WHERE status = 'closed') as closed_lots,
      COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold_lots
    FROM public.asset_heads
    WHERE project_id = $1 AND type = 'lot'
  `, [projectId])

  return result.rows[0]
}

async function generateHSEIncidents(projectId: string, dateFrom?: string, dateTo?: string) {
  const dateFilter = dateFrom && dateTo ? `AND a.created_at BETWEEN '${dateFrom}' AND '${dateTo}'` : ''

  const result = await pool.query(`
    SELECT
      COUNT(*) as total_incidents,
      COUNT(*) FILTER (WHERE a.content->>'severity' = 'high') as high_severity,
      COUNT(*) FILTER (WHERE a.content->>'category' = 'safety') as safety_incidents,
      COUNT(*) FILTER (WHERE a.content->>'category' = 'quality') as quality_incidents
    FROM public.asset_heads a
    WHERE a.project_id = $1 AND a.type = 'incident' ${dateFilter}
  `, [projectId])

  return result.rows[0]
}

async function generateProjectOverview(projectId: string) {
  const [assetsResult, documentsResult] = await Promise.all([
    pool.query(`
      SELECT type, COUNT(*) as count
      FROM public.asset_heads
      WHERE project_id = $1
      GROUP BY type
      ORDER BY count DESC
    `, [projectId]),

    pool.query(`
      SELECT COUNT(*) as total_documents,
             SUM(size) as total_size
      FROM public.documents
      WHERE project_id = $1
    `, [projectId])
  ])

  return {
    asset_breakdown: assetsResult.rows,
    documents: documentsResult.rows[0]
  }
}