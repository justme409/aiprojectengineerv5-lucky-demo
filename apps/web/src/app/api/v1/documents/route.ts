import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch processed documents from assets table (primary source)
    const processedResult = await pool.query(`
      SELECT
        a.id,
        a.name as document_name,
        a.content->>'file_name' as file_name,
        a.content->>'source_document_id' as source_document_id,
        a.document_number,
        a.revision_code,
        a.content->>'extracted_content' as extracted_content,
        a.content->>'blob_url' as blob_url,
        a.content->>'storage_path' as storage_path,
        a.metadata,
        a.status,
        a.created_at,
        a.updated_at,
        a.type,
        'processed' as processing_status
      FROM public.assets a
      WHERE a.project_id = $1
        AND a.type = 'document'
        AND a.is_deleted = false
        AND a.is_current = true
      ORDER BY a.updated_at DESC
      LIMIT $2 OFFSET $3
    `, [projectId, limit, offset])

    // Also fetch unprocessed documents from documents table
    const unprocessedResult = await pool.query(`
      SELECT
        d.id,
        d.file_name as document_name,
        d.file_name,
        null as source_document_id,
        d.document_number,
        d.revision_code,
        null as extracted_content,
        d.blob_url,
        d.storage_path,
        '{}'::json as metadata,
        d.processing_status as status,
        d.created_at,
        d.updated_at,
        'document' as type,
        d.processing_status
      FROM public.documents d
      WHERE d.project_id = $1
        AND d.processing_status != 'processed'
      ORDER BY d.created_at DESC
    `, [projectId])

    // Combine results, prioritizing processed documents
    const documents = [...processedResult.rows, ...unprocessedResult.rows]

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, fileName, contentType, size, blobUrl, storagePath } = body

    if (!projectId || !fileName) {
      return NextResponse.json({ error: 'projectId and fileName required' }, { status: 400 })
    }

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await pool.query(`
      INSERT INTO public.documents (
        id, project_id, blob_url, storage_path, file_name,
        content_type, size, uploaded_by
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *
    `, [projectId, blobUrl, storagePath, fileName, contentType, size, (session.user as any).id])

    return NextResponse.json({ document: result.rows[0] })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')
    const projectId = searchParams.get('projectId')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Try to delete from assets table first (processed documents)
    const assetResult = await pool.query(`
      UPDATE public.assets
      SET is_deleted = true, updated_at = NOW(), updated_by = $2
      WHERE id = $1 AND project_id = $3 AND is_deleted = false
      RETURNING *
    `, [documentId, (session.user as any).id, projectId])

    if (assetResult.rows.length > 0) {
      return NextResponse.json({ message: 'Document deleted successfully' })
    }

    // If not found in assets, try documents table (unprocessed documents)
    const documentResult = await pool.query(`
      DELETE FROM public.documents
      WHERE id = $1 AND project_id = $2 AND uploaded_by = $3
      RETURNING *
    `, [documentId, projectId, (session.user as any).id])

    if (documentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}