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
    const type = searchParams.get('type') // 'swms', 'permit', 'toolbox_talk', 'safety_walk', 'induction', 'incident', 'capa'
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

    let assetType = 'swms'
    if (type === 'permit') assetType = 'permit'
    else if (type === 'toolbox_talk') assetType = 'toolbox_talk'
    else if (type === 'safety_walk') assetType = 'safety_walk'
    else if (type === 'induction') assetType = 'induction'
    else if (type === 'incident') assetType = 'incident'
    else if (type === 'capa') assetType = 'capa'

    const result = await pool.query(`
      SELECT a.* FROM public.asset_heads a
      WHERE a.project_id = $1 AND a.type = $2
      ORDER BY a.created_at DESC
      LIMIT $3 OFFSET $4
    `, [projectId, assetType, limit, offset])

    return NextResponse.json({ hse_records: result.rows })
  } catch (error) {
    console.error('Error fetching HSE records:', error)
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
    const { projectId, type, name, content } = body

    let assetType = 'swms'
    if (type === 'permit') assetType = 'permit'
    else if (type === 'toolbox_talk') assetType = 'toolbox_talk'
    else if (type === 'safety_walk') assetType = 'safety_walk'
    else if (type === 'induction') assetType = 'induction'
    else if (type === 'incident') assetType = 'incident'
    else if (type === 'capa') assetType = 'capa'

    const spec = {
      asset: {
        type: assetType,
        name,
        project_id: projectId,
        content,
        status: 'draft'
      },
      edges: [],
      idempotency_key: `${assetType}:${name}:${projectId}`,
      audit_context: { action: 'create_hse_record', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error creating HSE record:', error)
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
      idempotency_key: `update_hse:${id}`,
      audit_context: { action: 'update_hse_record', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error updating HSE record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}