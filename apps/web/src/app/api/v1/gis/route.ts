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
    const type = searchParams.get('type') // 'geo_feature', 'inspection_request', etc.

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
      SELECT a.*, ST_AsGeoJSON(a.content->'geometry') as geometry_json
      FROM public.asset_heads a
      WHERE a.project_id = $1 AND a.content->'geometry' IS NOT NULL
    `
    const params = [projectId]
    let paramIndex = 2

    if (type) {
      query += ` AND a.type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    query += ` ORDER BY a.created_at DESC`

    const result = await pool.query(query, params)

    const features = result.rows.map(row => ({
      id: row.id,
      type: 'Feature',
      geometry: row.geometry_json ? JSON.parse(row.geometry_json) : null,
      properties: {
        asset_type: row.type,
        name: row.name,
        status: row.status,
        created_at: row.created_at
      }
    }))

    return NextResponse.json({
      type: 'FeatureCollection',
      features
    })
  } catch (error) {
    console.error('Error fetching GIS data:', error)
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
    const { projectId, type, name, geometry, properties } = body

    if (!projectId || !geometry) {
      return NextResponse.json({ error: 'projectId and geometry required' }, { status: 400 })
    }

    const spec = {
      asset: {
        type: type || 'geo_feature',
        name,
        project_id: projectId,
        content: {
          geometry,
          properties: properties || {}
        },
        status: 'active'
      },
      edges: [],
      idempotency_key: `gis:${type}:${name}:${projectId}`,
      audit_context: { action: 'create_geo_feature', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error creating GIS feature:', error)
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
    const { id, geometry, properties } = body

    const spec = {
      asset: {
        id,
        content: {
          geometry,
          properties: properties || {}
        }
      },
      edges: [],
      idempotency_key: `update_gis:${id}`,
      audit_context: { action: 'update_geo_feature', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error updating GIS feature:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}