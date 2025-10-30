import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

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
    const status = searchParams.get('status')
    const wbsNode = searchParams.get('wbs_node')

    // Build the query to get ITP register data (documents only) and join template document number if referenced
    let query = `
      SELECT
        a.id,
        a.name,
        a.document_number,
        a.revision_code,
        a.status,
        a.approval_state,
        a.created_at,
        a.updated_at,
        a.content,
        t.document_number AS template_document_number
      FROM public.asset_heads a
      LEFT JOIN LATERAL (
        SELECT t2.document_number
        FROM public.asset_edges e2
        JOIN public.asset_heads t2 ON t2.id = e2.to_asset_id AND t2.type = 'itp_template' AND t2.is_current AND NOT t2.is_deleted
        WHERE e2.from_asset_id = a.id AND e2.edge_type IN ('REFERENCES','TEMPLATE_FOR','INSTANCE_OF')
        ORDER BY e2.created_at DESC
        LIMIT 1
      ) t ON TRUE
      WHERE a.project_id = $1::uuid
        AND a.type = 'itp_document'
        AND a.is_current = true
        AND a.is_deleted = false
    `

    const queryParams = [projectId]
    let paramIndex = 2

    // Add status filter if provided
    if (status && status !== 'all') {
      query += ` AND a.approval_state = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // Add WBS filter if provided
    if (wbsNode) {
      query += ` AND a.content->>'wbs_node' = $${paramIndex}`
      queryParams.push(wbsNode)
      paramIndex++
    }

    query += ` ORDER BY a.updated_at DESC`

    const result = await pool.query(query, queryParams)

    // Basic stats for header cards are no longer needed by client, but keep minimal totals if used elsewhere
    const stats = {
      total: result.rows.length,
      approved: result.rows.filter(row => row.approval_state === 'approved').length,
      pending: result.rows.filter(row => row.approval_state === 'pending_review').length,
      draft: result.rows.filter(row => row.status === 'draft').length,
      completionRate: 0
    }

    return NextResponse.json({ itpRegister: result.rows, stats })
  } catch (error) {
    console.error('Error fetching ITP register:', error)
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
    const { name, documentNumber, revision, wbsNode, lbsNode, description } = body

    if (!name) {
      return NextResponse.json({ error: 'ITP name is required' }, { status: 400 })
    }

    // Create ITP register entry
    const itpAsset = {
      asset: {
        type: 'itp_document',
        name,
        project_id: projectId,
        document_number: documentNumber,
        revision_code: revision || '1',
        content: {
          wbs_node: wbsNode,
          lbs_node: lbsNode,
          description,
          item_count: 0,
          completed_items: 0,
          itp_register_entry: true
        },
        status: 'draft',
        approval_state: 'not_required'
      },
      edges: [],
      idempotency_key: `itp-register:${projectId}:${documentNumber || name}:${Date.now()}`,
      audit_context: { action: 'create_itp_register_entry', user_id: (session.user as any).id }
    }

    // Import the upsert function
    const { upsertAssetsAndEdges } = await import('@/lib/actions/graph-repo')
    const result = await upsertAssetsAndEdges(itpAsset, (session.user as any).id)

    return NextResponse.json({
      itpEntry: result,
      message: 'ITP register entry created successfully'
    })
  } catch (error) {
    console.error('Error creating ITP register entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

