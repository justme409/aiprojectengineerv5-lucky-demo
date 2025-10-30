import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string; attachmentId: string }> }
) {
  const client = await pool.connect()
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { assetId, attachmentId } = await params

    await client.query('BEGIN')

    // Delete the document asset row that represents the attachment
    await client.query('UPDATE public.assets SET is_deleted=true WHERE id=$1 AND type=$2', [attachmentId, 'document'])

    // Optionally, remove the REFERENCES edge entries for this attachment
    await client.query('DELETE FROM public.asset_edges WHERE from_asset_id=$1 OR to_asset_id=$1', [attachmentId])

    await client.query('COMMIT')
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    try { await client.query('ROLLBACK') } catch {}
    console.error('delete attachment error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  } finally {
    try { client.release() } catch {}
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string; attachmentId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { attachmentId } = await params
    const res = await pool.query('SELECT id, content->>\'file_name\' AS file_name, content->>\'content_type\' AS content_type, (content->>\'size\')::int AS size FROM public.assets WHERE id=$1 AND type=$2 AND NOT is_deleted', [attachmentId, 'document'])
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ attachment: res.rows[0] })
  } catch (error: any) {
    console.error('get attachment error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}


