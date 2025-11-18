import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { LOT_QUERIES } from '@/schemas/neo4j'
import { neo4jRead, neo4jWriteOne } from '@/lib/api/neo4j-handler'

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
    const result = await neo4jRead<Record<string, any>>(LOT_QUERIES.getLotRegister, {
      projectId,
    })

    if (result.error) {
      return result.error
    }

    return NextResponse.json({ lots: result.data })
  } catch (error) {
    console.error('Error fetching quality lots:', error)
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
    const { action } = body

    if (action === 'plan_sampling') {
      // Plan sampling for lots
      const samplingPlan = {
        lots: body.lotIds,
        sampling_method: 'annex_l',
        planned_samples: body.sampleCount,
        generated_at: new Date().toISOString()
      }

      return NextResponse.json({
        message: 'Sampling planned',
        plan: samplingPlan
      })
    } else if (action === 'close_lot') {
      const result = await neo4jWriteOne(
        LOT_QUERIES.updateLotStatusById,
        {
          projectId,
          lotId: body.lotId,
          status: 'closed',
        }
      )

      if (result.error) {
        return result.error
      }

      if (!result.data) {
        return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
      }

      return NextResponse.json({ message: 'Lot closed' })
    } else if (action === 'apply_indicative_conformance') {
      const result = await neo4jWriteOne(
        LOT_QUERIES.updateLotById,
        {
          projectId,
          lotId: body.lotId,
          properties: {
            indicativeConformance: body.conformanceData ?? {},
          },
        }
      )

      if (result.error) {
        return result.error
      }

      if (!result.data) {
        return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
      }

      return NextResponse.json({ message: 'Indicative conformance applied' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing quality lots action:', error)
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
    const { lotId, status } = body

    const result = await neo4jWriteOne(
      LOT_QUERIES.updateLotStatusById,
      {
        projectId,
        lotId,
        status,
      }
    )

    if (result.error) {
      return result.error
    }

    if (!result.data) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Lot updated' })
  } catch (error) {
    console.error('Error updating lot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}