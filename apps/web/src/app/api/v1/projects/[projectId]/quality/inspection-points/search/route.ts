import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { neo4jClient } from '@/lib/neo4j'
import { userHasProjectAccess } from '@/lib/neo4j/access'
import { InspectionPointNode } from '@/schemas/neo4j'
import { z } from 'zod'

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 75

const INSPECTION_POINT_SEARCH_QUERY = `
  MATCH (ip:InspectionPoint {projectId: $projectId})
  WHERE COALESCE(ip.isDeleted, false) = false
    AND ip.type IN ['hold', 'witness']
    AND (
      $query = '' OR
      toLower(COALESCE(ip.description, '')) CONTAINS toLower($query) OR
      toLower(COALESCE(ip.requirement, '')) CONTAINS toLower($query)
    )
  WITH ip
  OPTIONAL MATCH (lot:Lot)-[:IMPLEMENTS]->(:ITPInstance)-[:HAS_POINT]->(ip)
  WITH ip,
       collect(DISTINCT lot) AS lots,
       CASE WHEN $lotNodeId IS NULL THEN NULL ELSE toInteger($lotNodeId) END AS lotIdFilter
  WITH ip, lots, lotIdFilter
  WHERE lotIdFilter IS NULL OR any(l IN lots WHERE id(l) = lotIdFilter)
  RETURN ip {
    .* ,
    id: toString(id(ip)),
    lotNumbers: [l IN lots WHERE l IS NOT NULL | l.number]
  }
  ORDER BY ip.sequence
  LIMIT $limit
`

interface InspectionPointSearchRecord extends InspectionPointNode {
  id: string
  lotNumbers?: string[]
}

const searchParamsSchema = z.object({
  query: z.string().optional(),
  lotNodeId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional(),
})

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

    const parsed = searchParamsSchema.safeParse({
      query: searchParams.get('query') ?? undefined,
      lotNodeId: searchParams.get('lotNodeId') ?? searchParams.get('lot_node_id') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 })
    }

    const userId = (session.user as any).id as string
    const hasAccess = await userHasProjectAccess(userId, projectId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const query = parsed.data.query?.trim().toLowerCase() ?? ''
    const limit = parsed.data.limit ?? DEFAULT_LIMIT
    const lotNodeId = parsed.data.lotNodeId ?? null

    const inspectionPoints = await neo4jClient.read<InspectionPointSearchRecord>(
      INSPECTION_POINT_SEARCH_QUERY,
      {
        projectId,
        query,
        lotNodeId,
        limit,
      }
    )

    return NextResponse.json({ data: inspectionPoints })
  } catch (error) {
    console.error('Error searching inspection points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

