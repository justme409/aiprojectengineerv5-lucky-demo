import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { triggerProjectProcessingViaLangGraphEnhanced } from '@/lib/actions/langgraph-actions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; assetId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { projectId, assetId } = await params
    const body = await request.json()
    const { files, rowId } = body || {}
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'files required' }, { status: 400 })
    }

    const createdDocAssetIds: string[] = []

    for (const file of files) {
      const fileName: string = file.filename
      const contentType: string = file.type || 'application/octet-stream'
      const size: number = file.size || 0
      const storagePath = rowId ? `attachments/${assetId}/${rowId}/${fileName}` : `attachments/${assetId}/${fileName}`

      const spec = {
        asset: {
          type: 'document',
          name: fileName,
          project_id: projectId,
          content: {
            storage_path: storagePath,
            blob_url: `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER || 'documents'}/${storagePath}`,
            file_name: fileName,
            content_type: contentType,
            size: size,
            raw_content: null,
            document_metadata: null
          },
          status: 'draft'
        },
        edges: [
          // Reference back to the ITP template asset row context
          rowId ? {
            from_asset_id: '',
            to_asset_id: assetId,
            edge_type: 'REFERENCES',
            properties: { reference_type: 'row_attachment', row_id: rowId },
            idempotency_key: `REFERENCES:${assetId}:${rowId}:${fileName}`
          } : undefined
        ].filter(Boolean) as any[],
        idempotency_key: `document_attachment:${assetId}:${rowId || 'root'}:${fileName}`,
        audit_context: { action: 'upload_row_attachment', user_id: (session.user as any).id }
      }

      const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
      createdDocAssetIds.push(result.id)
    }

    // Trigger v10 document extraction for the newly added documents only
    try {
      const run = await triggerProjectProcessingViaLangGraphEnhanced(projectId, createdDocAssetIds)
      // We do not wait; respond immediately
      return NextResponse.json({ documentAssetIds: createdDocAssetIds, processing: run })
    } catch (e: any) {
      console.error('LangGraph trigger failed for attachments:', e)
      return NextResponse.json({ documentAssetIds: createdDocAssetIds, error: e.message || 'LangGraph trigger failed' }, { status: 207 })
    }
  } catch (error: any) {
    console.error('attachments complete error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}


