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
    const type = searchParams.get('type') // 'request', 'result', 'sample', 'method'
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

    let assetType = 'test_request'
    if (type === 'result') assetType = 'test_result'
    else if (type === 'sample') assetType = 'sample'
    else if (type === 'method') assetType = 'test_method'

    const result = await pool.query(`
      SELECT a.* FROM public.asset_heads a
      WHERE a.project_id = $1 AND a.type = $2
      ORDER BY a.created_at DESC
      LIMIT $3 OFFSET $4
    `, [projectId, assetType, limit, offset])

    return NextResponse.json({ tests: result.rows })
  } catch (error) {
    console.error('Error fetching tests:', error)
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

    let assetType = 'test_request'
    if (type === 'result') assetType = 'test_result'
    else if (type === 'sample') assetType = 'sample'
    else if (type === 'method') assetType = 'test_method'

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
      audit_context: { action: 'create_test', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error creating test:', error)
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
      idempotency_key: `update_test:${id}`,
      audit_context: { action: 'update_test', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}