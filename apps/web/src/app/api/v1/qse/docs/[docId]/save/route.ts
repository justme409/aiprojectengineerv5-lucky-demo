import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import {
  buildMetadataPatch,
  classifyQseAsset,
  findQseAssetByDocId,
  resolveAssetName,
} from '../../_utils'

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
    const normalizedDocId = decodedDocId.trim().toUpperCase()
    const body = await req.json()
    const content = body?.html ? { html: body.html } : { body: body?.body ?? '' }

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

    const existingAsset = await findQseAssetByDocId(organizationId, normalizedDocId)
    const classification = classifyQseAsset(normalizedDocId)
    const metadataPatch = buildMetadataPatch(normalizedDocId, classification)
    const assetName = resolveAssetName(normalizedDocId, existingAsset?.name)
    const userId = (session.user as any).id

    if (!existingAsset) {
      const result = await pool.query(
        `
          INSERT INTO public.assets (
            id,
            asset_uid,
            version,
            is_current,
            type,
            subtype,
            name,
            organization_id,
            document_number,
            metadata,
            content,
            status,
            created_by,
            updated_by
          ) VALUES (
            gen_random_uuid(),
            gen_random_uuid(),
            1,
            true,
            $1,
            $2,
            $3,
            $4,
            $5,
            $6::jsonb,
            $7::jsonb,
            'draft',
            $8,
            $8
          )
          RETURNING id
        `,
        [
          classification.type,
          classification.subtype,
          assetName,
          organizationId,
          normalizedDocId,
          metadataPatch,
          content,
          userId,
        ]
      )

      return NextResponse.json({ id: result.rows[0].id })
    }

    await pool.query(
      `
        UPDATE public.assets
        SET
          content = $1::jsonb,
          type = $2,
          subtype = $3,
          name = $4,
          document_number = $5,
          metadata = COALESCE(metadata, '{}'::jsonb) || $6::jsonb,
          updated_by = $7,
          updated_at = NOW()
        WHERE id = $8
      `,
      [
        content,
        classification.type,
        classification.subtype,
        assetName,
        normalizedDocId,
        metadataPatch,
        userId,
        existingAsset.id,
      ]
    )

    return NextResponse.json({ id: existingAsset.id })
  } catch (error) {
    console.error('Error saving QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
