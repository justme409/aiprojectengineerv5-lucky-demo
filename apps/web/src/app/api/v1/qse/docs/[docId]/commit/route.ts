import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { findQseAssetByDocId } from '../../_utils'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { docId } = await params
    const decodedDocId = decodeURIComponent(docId)

    // Get organization ID from user's organizations
    const orgResult = await pool.query(`
      SELECT organization_id FROM public.organization_users
      WHERE user_id = $1
      LIMIT 1
    `, [(session.user as any).id])

    if (orgResult.rows.length === 0) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const organizationId = orgResult.rows[0].organization_id

    const asset = await findQseAssetByDocId(organizationId, decodedDocId)

    if (!asset) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const assetId = asset.id

    // For now, just update the updated_at timestamp as a simple "commit"
    // This can be enhanced later with proper revision tracking
    await pool.query(`
      UPDATE public.assets
      SET updated_at = NOW(), updated_by = $1
      WHERE id = $2
    `, [(session.user as any).id, assetId])

    return NextResponse.json({
      id: assetId,
      revision_id: null,
      message: 'Document committed successfully'
    })
  } catch (error) {
    console.error('Error committing QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
