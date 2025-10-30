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

    // Get projects where the user is associated as a client
    // This could be through organization membership or specific client roles
    // Union projects visible via organization client roles OR explicit project membership
    const result = await pool.query(`
      (
        SELECT p.*, o.name as organization_name
        FROM public.projects p
        JOIN public.organizations o ON o.id = p.organization_id
        JOIN public.organization_users ou ON ou.organization_id = p.organization_id
        JOIN public.roles r ON r.id = ou.role_id
        WHERE ou.user_id = $1
          AND r.name IN ('client', 'client_admin', 'project_client')
          AND p.status IN ('active', 'completed')
      )
      UNION
      (
        SELECT p.*, o.name as organization_name
        FROM public.projects p
        JOIN public.organizations o ON o.id = p.organization_id
        JOIN public.project_members pm ON pm.project_id = p.id
        WHERE pm.user_id = $1
          AND 'portal_client' = ANY(pm.permissions)
          AND p.status IN ('active', 'completed')
      )
      ORDER BY updated_at DESC
    `, [userId])

    const projects = result.rows
    const ids: string[] = projects.map((p: any) => p.id)
    let enrichedMap: Record<string, { displayName: string, description?: string }> = {}
    if (ids.length > 0) {
      const assets = await pool.query(
        `SELECT project_id, name, content FROM public.asset_heads WHERE type='project' AND project_id = ANY($1::uuid[]) AND is_current AND NOT is_deleted`,
        [ids]
      )
      enrichedMap = Object.fromEntries(
        assets.rows.map((a: any) => [a.project_id, { displayName: a.name, description: a.content?.description }])
      )
    }

    // Get additional project metrics for each project
    const projectsWith = await Promise.all(
      projects.map(async (project: any) => {
        const statsResult = await pool.query(`
          SELECT
            COUNT(CASE WHEN type = 'lot' THEN 1 END) as total_lots,
            COUNT(CASE WHEN type = 'lot' AND status = 'completed' THEN 1 END) as completed_lots,
            COUNT(CASE WHEN approval_state = 'pending_review' THEN 1 END) as pending_approvals,
            COUNT(CASE WHEN type = 'inspection_request' THEN 1 END) as total_inspections
          FROM public.asset_heads
          WHERE project_id = $1 AND is_current AND NOT is_deleted
        `, [project.id])
        const stats = statsResult.rows[0]
        const enriched = enrichedMap[project.id] || {}
        const displayName = enriched.displayName || project.name || `Project ${String(project.id).slice(0,8)}`

        return {
          ...project,
          displayName,
          description: enriched.description || project.description,
          metrics: {
            totalLots: parseInt(stats.total_lots),
            completedLots: parseInt(stats.completed_lots),
            progress: stats.total_lots > 0 ? Math.round((stats.completed_lots / stats.total_lots) * 100) : 0,
            pendingApprovals: parseInt(stats.pending_approvals),
            totalInspections: parseInt(stats.total_inspections)
          }
        }
      })
    )

    return NextResponse.json({ projects: projectsWith, total: projectsWith.length })
  } catch (error) {
    console.error('Error fetching client projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
