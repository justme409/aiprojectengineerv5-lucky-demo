import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { azureStorage } from '@/lib/azure/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()
    const { files } = body

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Files array required' }, { status: 400 })
    }

    if (!azureStorage.isConfigured()) {
      return NextResponse.json({ error: 'Azure storage not configured' }, { status: 500 })
    }

    const normalized = (files as any[]).map((f: any) => ({
      name: f.name ?? f.file_name,
      contentType: f.contentType ?? f.content_type ?? 'application/octet-stream',
    }))

    const uploadUrls = await azureStorage.generateUploadUrls(normalized, projectId)

    const uploads = uploadUrls.map(u => ({
      filename: u.fileName,
      uploadUrl: u.uploadUrl,
      blobName: u.blobName,
      contentType: u.contentType,
    }))

    return NextResponse.json({ uploads, uploadUrls })
  } catch (error) {
    console.error('Error generating upload URLs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
