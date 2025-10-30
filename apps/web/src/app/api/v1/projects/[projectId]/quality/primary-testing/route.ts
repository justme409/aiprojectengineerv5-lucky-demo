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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await pool.query(`
      SELECT a.* FROM public.asset_heads a
      WHERE a.project_id = $1 AND a.type = 'lab'
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `, [projectId, limit, offset])

    return NextResponse.json({ labs: result.rows })
  } catch (error) {
    console.error('Error fetching primary testing data:', error)
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

    const spec = {
      asset: {
        type: 'lab',
        name: body.name,
        project_id: projectId,
        content: {
          accreditation_no: body.accreditation_no,
          nata_scope_url: body.nata_scope_url,
          accreditation_expiry: body.accreditation_expiry,
          ilac_mra_member: body.ilac_mra_member
        },
        status: 'approved'
      },
      edges: [],
      idempotency_key: `lab:${body.name}:${projectId}`,
      audit_context: { action: 'create_lab', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error creating lab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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

    const spec = {
      asset: {
        id: body.id,
        type: 'lab',
        name: body.name,
        project_id: projectId,
        content: {
          accreditation_no: body.accreditation_no,
          nata_scope_url: body.nata_scope_url,
          accreditation_expiry: body.accreditation_expiry,
          ilac_mra_member: body.ilac_mra_member
        }
      },
      edges: [],
      idempotency_key: `lab:${body.name}:${projectId}`,
      audit_context: { action: 'update_lab', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error updating lab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}