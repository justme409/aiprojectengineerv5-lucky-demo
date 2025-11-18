import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { neo4jClient } from '@/lib/neo4j'
import { userHasProjectAccess } from '@/lib/neo4j/access'
import {
  INSPECTION_REQUEST_QUERIES,
  InspectionRequestNode,
  LotNode,
  InspectionPointNode,
} from '@/schemas/neo4j'
import { z } from 'zod'

const MAX_LIMIT = 200
const DEFAULT_LIMIT = 50

interface InspectionRequestRecord extends InspectionRequestNode {
  id: string
  lot?: (LotNode & { id: string }) | null
  inspectionPointIds?: string[]
  inspectionPoints?: Array<InspectionPointNode & { id: string }>
}

const listQueryParamsSchema = z.object({
  projectId: z.string(),
  status: z.string().optional(),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

const createSchema = z.object({
  projectId: z.string(),
  checkpointId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  slaHours: z.coerce.number().optional(),
  scheduledAt: z.string().optional(),
  lotNodeId: z.string().optional(),
  inspectionPointNodeIds: z.array(z.string()).optional(),
})

const updateSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  approvalState: z.string().optional(),
  description: z.string().optional(),
  slaHours: z.coerce.number().optional(),
  scheduledAt: z.string().optional(),
  lotNodeId: z.string().optional(),
  inspectionPointNodeIds: z.array(z.string()).optional(),
})

function parseProjectIdFromSearchParams(searchParams: URLSearchParams): string | null {
  return searchParams.get('projectId') || searchParams.get('project_id')
}

function computeSlaDueAt(scheduledAtIso: string | null, slaHours?: number) {
  if (!scheduledAtIso || typeof slaHours !== 'number' || Number.isNaN(slaHours)) {
    return null
  }
  const start = new Date(scheduledAtIso)
  if (Number.isNaN(start.getTime())) {
    return null
  }
  const due = new Date(start.getTime() + slaHours * 60 * 60 * 1000)
  return due.toISOString()
}

function parseIsoDateOrReturnError(value?: string | null): { iso: string | null; error?: string } {
  if (!value) {
    return { iso: null }
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return { iso: null, error: 'Invalid datetime value' }
  }
  return { iso: parsed.toISOString() }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = parseProjectIdFromSearchParams(searchParams)

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    const listParams = listQueryParamsSchema.safeParse({
      projectId,
      status: searchParams.get('status') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    })

    if (!listParams.success) {
      return NextResponse.json({ error: listParams.error.message }, { status: 400 })
    }

    const userId = (session.user as any).id as string
    const hasAccess = await userHasProjectAccess(userId, listParams.data.projectId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const params = {
      projectId: listParams.data.projectId,
      status: listParams.data.status ?? null,
      limit: listParams.data.limit ?? DEFAULT_LIMIT,
      offset: listParams.data.offset ?? 0,
    }

    const inspections = await neo4jClient.read<InspectionRequestRecord>(
      INSPECTION_REQUEST_QUERIES.listByProject,
      params
    )

    return NextResponse.json({ data: inspections })
  } catch (error) {
    console.error('Error fetching inspections:', error)
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
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 })
    }

    const {
      projectId,
      checkpointId,
      name,
      description,
      slaHours,
      scheduledAt,
      lotNodeId,
      inspectionPointNodeIds,
    } = parsed.data

    const userId = (session.user as any).id as string
    const hasAccess = await userHasProjectAccess(userId, projectId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { iso: scheduledAtIso, error: scheduledAtError } = parseIsoDateOrReturnError(scheduledAt)
    if (scheduledAtError) {
      return NextResponse.json({ error: scheduledAtError }, { status: 400 })
    }
    const slaDueAtIso = computeSlaDueAt(scheduledAtIso, slaHours)

    const created = await neo4jClient.writeOne<InspectionRequestRecord>(
      INSPECTION_REQUEST_QUERIES.create,
      {
        projectId,
        checkpointId,
        name,
        description: description ?? null,
        slaHours: typeof slaHours === 'number' ? slaHours : null,
        scheduledAt: scheduledAtIso,
        slaDueAt: slaDueAtIso,
        requestedForAt: scheduledAtIso,
        lotNodeId: lotNodeId ?? null,
        inspectionPointNodeIds: inspectionPointNodeIds ?? [],
        status: 'draft',
        approvalState: 'not_required',
      }
    )

    return NextResponse.json({ data: created })
  } catch (error) {
    console.error('Error creating inspection:', error)
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
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 })
    }

    const { id, status, approvalState, description, slaHours, scheduledAt, lotNodeId, inspectionPointNodeIds } = parsed.data

    const existing = await neo4jClient.readOne<InspectionRequestRecord>(
      INSPECTION_REQUEST_QUERIES.findById,
      { id }
    )

    if (!existing) {
      return NextResponse.json({ error: 'Inspection request not found' }, { status: 404 })
    }

    const userId = (session.user as any).id as string
    const hasAccess = await userHasProjectAccess(userId, existing.projectId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const scheduledAtResult = parseIsoDateOrReturnError(scheduledAt)
    if (scheduledAtResult.error) {
      return NextResponse.json({ error: scheduledAtResult.error }, { status: 400 })
    }
    const scheduledAtIso = scheduledAtResult.iso
    const slaDueAtIso = computeSlaDueAt(scheduledAtIso, slaHours)

    if (lotNodeId !== undefined || inspectionPointNodeIds !== undefined) {
      const queries: Array<{ cypher: string; params?: Record<string, any> }> = [
        {
          cypher: `
            MATCH (ir:InspectionRequest)
            WHERE id(ir) = toInteger($id)
            OPTIONAL MATCH (ir)-[rLot:FOR_LOT]->(:Lot)
            DELETE rLot
            SET ir.lotNumber = NULL,
                ir.lotNodeId = NULL
            WITH ir
            OPTIONAL MATCH (ir)-[rPoint:REQUESTS_POINT]->(:InspectionPoint)
            DELETE rPoint
          `,
          params: { id },
        },
      ]

      if (lotNodeId) {
        queries.push({
          cypher: `
            MATCH (ir:InspectionRequest)
            WHERE id(ir) = toInteger($id)
            MATCH (lot:Lot)
            WHERE id(lot) = toInteger($lotNodeId)
            MERGE (ir)-[:FOR_LOT]->(lot)
            SET ir.lotNumber = lot.number,
                ir.lotNodeId = toString(id(lot))
          `,
          params: { id, lotNodeId },
        })
      }

      if (inspectionPointNodeIds && inspectionPointNodeIds.length > 0) {
        queries.push({
          cypher: `
            MATCH (ir:InspectionRequest)
            WHERE id(ir) = toInteger($id)
            UNWIND $inspectionPointNodeIds AS pointId
            MATCH (point:InspectionPoint)
            WHERE id(point) = toInteger(pointId)
            MERGE (ir)-[:REQUESTS_POINT]->(point)
          `,
          params: { id, inspectionPointNodeIds },
        })
      }

      await neo4jClient.transaction(queries)
    }

    const updated = await neo4jClient.writeOne<InspectionRequestRecord>(
      INSPECTION_REQUEST_QUERIES.update,
      {
        id,
        status: status ?? null,
        approvalState: approvalState ?? null,
        description: description ?? null,
        slaHours: typeof slaHours === 'number' ? slaHours : null,
        scheduledAt: scheduledAtIso,
        slaDueAt: slaDueAtIso,
      }
    )

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update inspection request' }, { status: 500 })
    }

    const refreshed = await neo4jClient.readOne<InspectionRequestRecord>(
      INSPECTION_REQUEST_QUERIES.findById,
      { id }
    )

    return NextResponse.json({ data: refreshed ?? updated })
  } catch (error) {
    console.error('Error updating inspection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}