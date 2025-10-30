import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    let query = `
      SELECT a.* FROM public.asset_heads a
      WHERE a.project_id = $1 AND a.type = 'daily_diary'
    `
    const params = [projectId]
    let paramIndex = 2

    if (date) {
      query += ` AND (a.content->>'date') = $${paramIndex}`
      params.push(date)
      paramIndex++
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit.toString(), offset.toString())

    const result = await pool.query(query, params)
    return NextResponse.json({ daily_diaries: result.rows })
  } catch (error) {
    console.error('Error fetching daily diaries:', error)
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
    const { projectId, date, content } = body

    const spec = {
      asset: {
        type: 'daily_diary',
        name: `Daily Diary - ${date}`,
        project_id: projectId,
        content: {
          date,
          ...content
        },
        status: 'draft'
      },
      edges: [],
      idempotency_key: `daily_diary:${date}:${projectId}`,
      audit_context: { action: 'create_daily_diary', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error creating daily diary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, content, status } = body

    const spec = {
      asset: {
        id,
        content,
        status
      },
      edges: [],
      idempotency_key: `update_daily_diary:${id}`,
      audit_context: { action: 'update_daily_diary', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error updating daily diary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}