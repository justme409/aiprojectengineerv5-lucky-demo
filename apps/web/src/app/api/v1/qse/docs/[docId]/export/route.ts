import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import HTMLtoDOCX from 'html-to-docx'
import { findQseAssetByDocId, resolveAssetName } from '../../_utils'

export async function GET(
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

    const asset = await findQseAssetByDocId(organizationId, normalizedDocId)

    if (!asset) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const content = asset.content as any
    const title = resolveAssetName(normalizedDocId, asset.name) || 'QSE Document'
    const html = (content.html as string) || ((content.body as string) || '').replace(/\n/g, '<br/>')

    const buffer = await HTMLtoDOCX(
      `<h1>${title}</h1>${html}`,
      null,
      { table: { row: { cantSplit: true } }, footer: false, pageNumber: false }
    )

    const body = new Uint8Array(buffer)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9_-]+/g,'_')}.docx"`,
        'Content-Length': String(body.byteLength),
      },
    })
  } catch (error) {
    console.error('Error exporting QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
