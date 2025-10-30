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
    const projectId = searchParams.get('project_id')
    const date = searchParams.get('date')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Fetch roster entries from assets
    const result = await pool.query(`
      SELECT a.*,
             json_agg(json_build_object(
               'id', ra.id,
               'user_id', ra.user_id,
               'role', ra.role,
               'start_time', ra.start_time,
               'end_time', ra.end_time,
               'notes', ra.notes
             )) as assignments
      FROM public.asset_heads a
      LEFT JOIN public.roster_assignments ra ON ra.roster_asset_id = a.id
      WHERE a.project_id = $1 AND a.type = 'roster'
        AND ($2::date IS NULL OR DATE(ra.start_time) = $2::date)
      GROUP BY a.id, a.asset_uid, a.version, a.is_current, a.supersedes_asset_id,
               a.version_label, a.effective_from, a.effective_to, a.type, a.subtype,
               a.name, a.organization_id, a.project_id, a.parent_asset_id, a.document_number,
               a.revision_code, a.path_key, a.status, a.approval_state, a.classification,
               a.idempotency_key, a.metadata, a.content, a.due_sla_at, a.scheduled_at,
               a.requested_for_at, a.created_at, a.created_by, a.updated_at, a.updated_by, a.is_deleted
      ORDER BY a.created_at DESC
    `, [projectId, date])

    return NextResponse.json({ roster: result.rows })
  } catch (error) {
    console.error('Error fetching roster:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, name, date, assignments } = body

    if (!projectId || !name) {
      return NextResponse.json({ error: 'Project ID and name required' }, { status: 400 })
    }

    // Create roster asset
    const rosterAsset = {
      asset: {
        type: 'roster',
        name,
        project_id: projectId,
        content: {
          date,
          assignments_count: assignments?.length || 0
        },
        status: 'active'
      },
      edges: [],
      idempotency_key: `roster:${projectId}:${date}`,
      audit_context: { action: 'create_roster', user_id: (session.user as any).id }
    }

    // Import the upsert function
    const { upsertAssetsAndEdges } = await import('@/lib/actions/graph-repo')
    const result = await upsertAssetsAndEdges(rosterAsset, (session.user as any).id)

    // If there are assignments, create them
    if (assignments && assignments.length > 0) {
      const assignmentPromises = assignments.map(async (assignment: any) => {
        const assignmentResult = await pool.query(`
          INSERT INTO roster_assignments (
            roster_asset_id, user_id, role, start_time, end_time, notes, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [
          result.id,
          assignment.userId,
          assignment.role,
          assignment.startTime,
          assignment.endTime,
          assignment.notes,
          (session.user as any).id
        ])
        return assignmentResult.rows[0]
      })

      await Promise.all(assignmentPromises)
    }

    return NextResponse.json({
      roster: result,
      message: 'Roster created successfully'
    })
  } catch (error) {
    console.error('Error creating roster:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}