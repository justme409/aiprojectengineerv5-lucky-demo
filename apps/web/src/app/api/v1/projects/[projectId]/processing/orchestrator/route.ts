import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { triggerProjectProcessingViaLangGraphEnhanced } from '@/lib/actions/langgraph-actions'

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
    const { documentIds } = await request.json().catch(() => ({ documentIds: undefined })) as { documentIds?: string[] }

    // Ensure the requesting user belongs to the project's organisation
    const accessCheck = await pool.query(
      `SELECT 1 FROM public.projects p
         JOIN public.organization_users ou ON ou.organization_id = p.organization_id
       WHERE p.id = $1 AND ou.user_id = $2
       LIMIT 1`,
      [projectId, (session.user as any).id]
    )

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const run = await triggerProjectProcessingViaLangGraphEnhanced(projectId, documentIds)

    return NextResponse.json({ run })
  } catch (error) {
    console.error('Failed to trigger orchestrator:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
