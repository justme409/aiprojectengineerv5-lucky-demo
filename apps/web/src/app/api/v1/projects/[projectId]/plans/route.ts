import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

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
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'wbs' or 'lbs'

    if (type === 'wbs') {
      const result = await pool.query(`
        SELECT a.*,
               json_agg(json_build_object(
                 'id', child.id,
                 'name', child.name,
                 'path_key', child.path_key,
                 'type', child.type
               )) as children
        FROM public.asset_heads a
        LEFT JOIN public.asset_edges ae ON ae.from_asset_id = a.id AND ae.edge_type = 'PARENT_OF'
        LEFT JOIN public.assets child ON child.id = ae.to_asset_id AND child.is_current AND NOT child.is_deleted
        WHERE a.project_id = $1 AND a.type = 'wbs_node'
        GROUP BY a.id, a.asset_uid, a.version, a.is_current, a.supersedes_asset_id,
                 a.version_label, a.effective_from, a.effective_to, a.type, a.subtype,
                 a.name, a.organization_id, a.project_id, a.parent_asset_id, a.document_number,
                 a.revision_code, a.path_key, a.status, a.approval_state, a.classification,
                 a.idempotency_key, a.metadata, a.content, a.due_sla_at, a.scheduled_at,
                 a.requested_for_at, a.created_at, a.created_by, a.updated_at, a.updated_by, a.is_deleted
        ORDER BY a.path_key
      `, [projectId])

      return NextResponse.json({ wbs: result.rows })
    } else if (type === 'lbs') {
      const result = await pool.query(`
        SELECT a.*,
               json_agg(json_build_object(
                 'id', child.id,
                 'name', child.name,
                 'path_key', child.path_key,
                 'type', child.type
               )) as children
        FROM public.asset_heads a
        LEFT JOIN public.asset_edges ae ON ae.from_asset_id = a.id AND ae.edge_type = 'PARENT_OF'
        LEFT JOIN public.assets child ON child.id = ae.to_asset_id AND child.is_current AND NOT child.is_deleted
        WHERE a.project_id = $1 AND a.type = 'lbs_node'
        GROUP BY a.id, a.asset_uid, a.version, a.is_current, a.supersedes_asset_id,
                 a.version_label, a.effective_from, a.effective_to, a.type, a.subtype,
                 a.name, a.organization_id, a.project_id, a.parent_asset_id, a.document_number,
                 a.revision_code, a.path_key, a.status, a.approval_state, a.classification,
                 a.idempotency_key, a.metadata, a.content, a.due_sla_at, a.scheduled_at,
                 a.requested_for_at, a.created_at, a.created_by, a.updated_at, a.updated_by, a.is_deleted
        ORDER BY a.path_key
      `, [projectId])

      return NextResponse.json({ lbs: result.rows })
    } else {
      return NextResponse.json({ error: 'Type parameter required (wbs or lbs)' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()
    const { type, name, path_key, parent_asset_id } = body

    if (!['wbs_node', 'lbs_node'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const spec = {
      asset: {
        type,
        name,
        project_id: projectId,
        path_key,
        parent_asset_id,
        status: 'draft'
      },
      edges: [], // Edges will be created after asset creation if needed
      idempotency_key: `${type}:${path_key}:${projectId}`,
      audit_context: { action: 'create_plan_node', user_id: (session.user as any).id }
    }

    // Create the asset using the graph-repo function
    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)

    // If there's a parent, create the edge
    if (parent_asset_id && result.id) {
      const edgeSpec = {
        asset: {}, // No asset creation
        edges: [{
          from_asset_id: parent_asset_id,
          to_asset_id: result.id,
          edge_type: 'PARENT_OF' as const,
          properties: {}
        }],
        idempotency_key: `edge:${parent_asset_id}:${result.id}`,
        audit_context: { action: 'create_plan_edge', user_id: (session.user as any).id }
      }

      await upsertAssetsAndEdges(edgeSpec, (session.user as any).id)
    }

    return NextResponse.json({ node: result })
  } catch (error) {
    console.error('Error creating plan node:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}