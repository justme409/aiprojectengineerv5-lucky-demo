import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { azureStorage } from '@/lib/azure/storage'
import { triggerProjectProcessingViaLangGraphEnhanced } from '@/lib/actions/langgraph-actions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string | undefined

    const { projectId } = await params
    const body = await request.json()
    // Support both shapes: { files: [{ fileName, blobName, contentType, size }] } or
    // legacy { document_ids } which we ignore here for asset creation
    const { files } = body

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Files array required' }, { status: 400 })
    }

    // Create document assets for uploaded files
    const documentAssets: Array<{ id: string, fileName: string }> = []

    for (const file of files) {
      const fileName = file.fileName ?? file.filename
      const blobName = file.blobName ?? file.storage_path ?? `projects/${projectId}/${fileName}`
      const contentType = file.contentType ?? file.type ?? 'application/octet-stream'
      const size = file.size
     const spec = {
        asset: {
          type: 'document',
          name: fileName,
          project_id: projectId,
          content: {
            storage_path: blobName,
            blob_url: azureStorage.isConfigured()
              ? azureStorage.getPublicUrl(blobName)
              : `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER || 'documents'}/${blobName}`,
            file_name: fileName,
            content_type: contentType,
            size: size,
            // Reserve fields for agent outputs under asset.content
            raw_content: null,
            document_metadata: null,
          },
          status: 'draft'
        },
        edges: [],
        idempotency_key: `document:${fileName}:${projectId}`,
        audit_context: { action: 'upload_document', user_id: userId }
      }

      const result = await upsertAssetsAndEdges(spec, userId)
      documentAssets.push({ id: result.id, fileName })
    }

    // Trigger document addition agent with metadata extraction - NO MOCK DATA
    try {
      // Prepare document files for the addition agent
      const documentFiles = files.map(file => ({
        file_name: file.fileName ?? file.filename,
        content_type: file.contentType ?? file.type ?? 'application/octet-stream',
        size: file.size,
        blob_url: azureStorage.isConfigured()
          ? azureStorage.getPublicUrl(file.blobName ?? file.storage_path ?? `projects/${projectId}/${file.fileName ?? file.filename}`)
          : `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER || 'documents'}/${file.blobName ?? file.storage_path ?? `projects/${projectId}/${file.fileName ?? file.filename}`}`,
        storage_path: file.blobName ?? file.storage_path ?? `projects/${projectId}/${file.fileName ?? file.filename}`
      }))

      // Import and trigger the document addition agent
      const { triggerDocumentAdditionAgent } = await import('@/lib/actions/document-addition-actions')

      const additionResult = await triggerDocumentAdditionAgent(
        projectId,
        documentFiles,
        userId ?? null
      )

      return NextResponse.json({
        message: 'Document addition and processing initiated successfully',
        documents: documentAssets,
        processing: {
          thread_id: additionResult.thread_id,
          run_id: additionResult.run_id,
          processed_count: additionResult.processed_count,
          failed_count: additionResult.failed_count
        }
      })
    } catch (additionError) {
      console.error('Document addition processing failed:', additionError)
      return NextResponse.json({
        message: 'Documents uploaded but processing failed',
        documents: documentAssets,
        error: (additionError as any)?.message || 'Unknown error'
      }, { status: 207 }) // Multi-status response
    }
  } catch (error) {
    console.error('Error processing uploads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
