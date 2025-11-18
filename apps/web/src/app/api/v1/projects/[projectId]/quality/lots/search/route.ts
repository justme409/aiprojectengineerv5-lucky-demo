import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { neo4jClient } from '@/lib/neo4j'
import { userHasProjectAccess } from '@/lib/neo4j/access'
import { LotNode } from '@/schemas/neo4j'
import { z } from 'zod'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

const LOT_SEARCH_QUERY = `
  MATCH (l:Lot {projectId: $projectId})
  WHERE COALESCE(l.isDeleted, false) = false
    AND (
      $query = '' OR
      toLower(l.number) CONTAINS toLower($query) OR
      toLower(COALESCE(l.description, '')) CONTAINS toLower($query) OR
      toLower(COALESCE(l.workType, '')) CONTAINS toLower($query)
    )
  RETURN l { .* , id: toString(id(l)) }
  ORDER BY l.number
  LIMIT $limit
`

interface LotSearchRecord extends LotNode {
  id: string
}

const searchParamsSchema = z.object({
  query: z.string().optional(),
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

    const lots = await neo4jClient.read<LotSearchRecord>(LOT_SEARCH_QUERY, {
      projectId,
      query,
      limit,
    })

    return NextResponse.json({ data: lots })
  } catch (error) {
    console.error('Error searching lots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

