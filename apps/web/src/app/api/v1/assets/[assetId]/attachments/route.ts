import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const rowId = searchParams.get('rowId')
    const { assetId } = await params

    // List document assets that reference the given asset (template) with row context
    // We look for edges of type REFERENCES with properties.reference_type='row_attachment' and row_id matches
    const q = `
      SELECT a.id,
             COALESCE(a.content->>'file_name', a.name) AS file_name,
             (a.content->>'size')::int AS size,
             a.content->>'content_type' AS content_type
      FROM public.assets a
      JOIN public.asset_edges e ON e.from_asset_id = a.id AND e.edge_type = 'REFERENCES'
      WHERE a.type = 'document' AND NOT a.is_deleted
        AND e.to_asset_id = $1
        AND (e.properties->>'reference_type') = 'row_attachment'
        AND ($2::text IS NULL OR (e.properties->>'row_id') = $2)
      ORDER BY a.created_at DESC
    `
    const { rows } = await pool.query(q, [assetId, rowId])
    return NextResponse.json({ attachments: rows })
  } catch (error: any) {
    console.error('list attachments error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}


