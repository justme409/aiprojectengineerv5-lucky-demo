import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { triggerProjectProcessingViaLangGraphEnhanced } from '@/lib/actions/langgraph-actions'
import { runGraph } from '@/lib/actions/langgraph-server-actions'

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
    const { templateId, wbsNodeIds } = body

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get WBS structure for the project
    const wbsResult = await pool.query(`
      SELECT content FROM public.asset_heads
      WHERE project_id = $1 AND type = 'wbs'
      ORDER BY created_at DESC
      LIMIT 1
    `, [projectId])

    if (wbsResult.rows.length === 0) {
      return NextResponse.json({ error: 'No WBS structure found for project' }, { status: 400 })
    }

    const wbsStructure = wbsResult.rows[0].content

    // Filter WBS nodes if specific IDs provided
    let filteredWbsNodes = wbsStructure?.nodes || []
    if (wbsNodeIds && wbsNodeIds.length > 0) {
      filteredWbsNodes = filteredWbsNodes.filter((node: any) =>
        wbsNodeIds.includes(node.id)
      )
    }

    // Mark nodes as requiring ITP generation
    const itpTargets = filteredWbsNodes.map((node: any) => ({
      ...node,
      itp_required: true,
      is_leaf_node: !node.children || node.children.length === 0
    }))

    // Run ITP generation graph
    const itpRun = await runGraph('itp_generation', {
      project_id: projectId,
      wbs_structure: {
        ...wbsStructure,
        nodes: itpTargets
      }
    })

    return NextResponse.json({
      message: 'ITP generation initiated successfully',
      run_id: itpRun.id,
      status: itpRun.status,
      target_nodes: itpTargets.length
    })
  } catch (error) {
    console.error('Error generating ITP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}