import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get user's projects
    const projectsResult = await pool.query(`
      SELECT p.id, p.name, p.status, p.created_at, p.updated_at
      FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE ou.user_id = $1
      ORDER BY p.updated_at DESC
    `, [userId])

    const projects = projectsResult.rows
    const projectIds = projects.map(p => p.id)

    if (projectIds.length === 0) {
      return NextResponse.json({
        metrics: {
          activeProjects: 0,
          pendingInspections: 0,
          completedLots: 0
        },
        recentProjects: []
      })
    }

    // Get metrics across all user's projects
    const [activeProjectsResult, pendingInspectionsResult, completedLotsResult] = await Promise.all([
      // Active projects
      pool.query(`
        SELECT COUNT(*) as count
        FROM public.projects
        WHERE id = ANY($1) AND status = 'active'
      `, [projectIds]),

      // Pending inspections
      pool.query(`
        SELECT COUNT(*) as count
        FROM public.asset_heads
        WHERE project_id = ANY($1)
          AND type = 'inspection_request'
          AND (status = 'pending_review' OR status = 'draft')
      `, [projectIds]),

      // Completed lots
      pool.query(`
        SELECT COUNT(*) as count
        FROM public.asset_heads
        WHERE project_id = ANY($1)
          AND type = 'lot'
          AND status = 'completed'
      `, [projectIds])
    ])

    // Get recent projects (last 2)
    const recentProjects = projects.slice(0, 2).map(project => ({
      id: project.id,
      name: project.name,
      updated_at: project.updated_at || project.created_at
    }))

    return NextResponse.json({
      metrics: {
        activeProjects: parseInt(activeProjectsResult.rows[0].count),
        pendingInspections: parseInt(pendingInspectionsResult.rows[0].count),
        completedLots: parseInt(completedLotsResult.rows[0].count)
      },
      recentProjects
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
