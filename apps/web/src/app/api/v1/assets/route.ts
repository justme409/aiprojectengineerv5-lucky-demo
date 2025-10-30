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
    const type = searchParams.get('type')
    const documentNumber = searchParams.get('documentNumber')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = `
      SELECT a.* FROM public.asset_heads a
      WHERE 1=1
    `
    const params = []
    let paramIndex = 1

    if (projectId) {
      query += ` AND a.project_id = $${paramIndex}`
      params.push(projectId)
      paramIndex++
    }

    if (type) {
      query += ` AND a.type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    if (documentNumber) {
      query += ` AND a.document_number = $${paramIndex}`
      params.push(documentNumber)
      paramIndex++
    }

    // Check user has access to project via org membership OR explicit project membership
    if (projectId) {
      const userId = (session.user as any).id
      const orgAccess = await pool.query(
        `SELECT 1 FROM public.projects p
         JOIN public.organization_users ou ON ou.organization_id = p.organization_id
         WHERE p.id = $1 AND ou.user_id = $2`
      , [projectId, userId])
      if (orgAccess.rows.length === 0) {
        const projectAccess = await pool.query(
          `SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2`
        , [projectId, userId])
        if (projectAccess.rows.length === 0) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      }
    }

    query += ` ORDER BY a.document_number NULLS LAST, a.version DESC, a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await pool.query(query, params)
    return NextResponse.json({ assets: result.rows })
  } catch (error) {
    console.error('Error fetching assets:', error)
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
    const spec = {
      asset: body.asset,
      edges: body.edges || [],
      idempotency_key: body.idempotency_key,
      audit_context: { action: 'create_asset', user_id: (session.user as any).id, ...body.audit_context }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error creating asset:', error)
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
    const spec = {
      asset: { ...body.asset, id: body.asset.id },
      edges: body.edges || [],
      idempotency_key: body.idempotency_key || `update:${body.asset.id}`,
      audit_context: { action: 'update_asset', user_id: (session.user as any).id, ...body.audit_context }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
