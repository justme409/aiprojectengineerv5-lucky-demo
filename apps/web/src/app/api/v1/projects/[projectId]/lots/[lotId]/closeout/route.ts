import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { LOT_QUERIES } from '@/schemas/neo4j'
import { neo4jReadOne, neo4jWriteOne } from '@/lib/api/neo4j-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; lotId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, lotId } = await params

    const result = await neo4jReadOne<Record<string, any>>(
      LOT_QUERIES.getLotRegisterById,
      {
        projectId,
        lotId,
      }
    )

    if (result.error) {
      return result.error
    }

    if (!result.data) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    const lotData = result.data

    // Check if lot can be closed
    const canClose = lotData.inspectionPoints.every((ip: any) =>
      ip.approvalState === 'approved' && ip.releasedAt
    )

    return NextResponse.json({
      lot: lotData,
      can_close: canClose,
      blocking_items: canClose ? [] : lotData.inspectionPoints.filter((ip: any) =>
        ip.approvalState !== 'approved' || !ip.releasedAt
      )
    })
  } catch (error) {
    console.error('Error fetching lot closeout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; lotId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, lotId } = await params
    const body = await request.json()
    const { action } = body

    if (action === 'generate_pack') {
      // Generate lot closeout pack
      const packData = {
        lot_id: lotId,
        project_id: projectId,
        generated_at: new Date().toISOString(),
        generated_by: (session.user as any).id,
        documents: [
          'conformance_statement.pdf',
          'test_results.pdf',
          'inspection_reports.pdf'
        ]
      }

      return NextResponse.json({
        message: 'Lot closeout pack generated',
        pack: packData
      })
    } else if (action === 'close_lot') {
      const result = await neo4jWriteOne(
        LOT_QUERIES.updateLotStatusById,
        {
          projectId,
          lotId,
          status: 'closed',
        }
      )

      if (result.error) {
        return result.error
      }

      if (!result.data) {
        return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
      }

      return NextResponse.json({ message: 'Lot closed successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing lot closeout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}