import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params
    // Simple version list based on asset_uid versions
    const q = `
      SELECT id, version, created_at, (metadata->>'commit_message') AS commit_message, status
      FROM public.assets
      WHERE asset_uid = (SELECT asset_uid FROM public.assets WHERE id = $1)
        AND NOT is_deleted
      ORDER BY version DESC
    `
    const { rows } = await pool.query(q, [assetId])
    return NextResponse.json({ revisions: rows })
  } catch (error: any) {
    console.error('list revisions error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const client = await pool.connect()
  try {
    const { assetId } = await params
    const body = await request.json()
    const commitMessage: string | null = body?.commitMessage || null

    await client.query('BEGIN')

    // Read current
    const cur = await client.query('SELECT * FROM public.assets WHERE id=$1 AND NOT is_deleted', [assetId])
    if (cur.rows.length === 0) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 })
    const a = cur.rows[0]

    // Insert new version
    const ins = await client.query(
      `INSERT INTO public.assets (
         id, asset_uid, version, is_current, supersedes_asset_id, type, subtype, name, organization_id, project_id,
         document_number, revision_code, path_key, status, approval_state, classification, idempotency_key, metadata, content
       ) VALUES (
         gen_random_uuid(), $1, $2, true, $3, $4, $5, $6, $7, $8,
         $9, $10, $11, $12, $13, $14, $15,
         jsonb_set(COALESCE($16::jsonb, '{}'::jsonb), '{commit_message}', to_jsonb($17::text), true),
         $18
       ) RETURNING id`,
      [
        a.asset_uid,
        (a.version || 1) + 1,
        a.id,
        a.type,
        a.subtype,
        a.name,
        a.organization_id,
        a.project_id,
        a.document_number,
        a.revision_code,
        a.path_key,
        a.status,
        a.approval_state,
        a.classification,
        a.idempotency_key,
        a.metadata,
        commitMessage,
        a.content
      ]
    )

    await client.query('UPDATE public.assets SET is_current=false, updated_at=NOW() WHERE id=$1', [assetId])
    await client.query('COMMIT')
    return NextResponse.json({ success: true, data: { new_asset_id: ins.rows[0].id } })
  } catch (error: any) {
    try { await client.query('ROLLBACK') } catch {}
    console.error('create revision error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  } finally {
    try { client.release() } catch {}
  }
}


