import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { azureStorage } from '@/lib/azure/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; assetId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { projectId, assetId } = await params
    const body = await request.json()
    const { filenames, rowId } = body || {}
    if (!Array.isArray(filenames) || filenames.length === 0) {
      return NextResponse.json({ error: 'filenames required' }, { status: 400 })
    }

    const uploads: Array<{ filename: string; uploadUrl: string }> = []

    for (const filename of filenames) {
      const blobName = rowId
        ? `attachments/${assetId}/${rowId}/${filename}`
        : `attachments/${assetId}/${filename}`
      const uploadUrl = await azureStorage.generateUploadUrls([
        { name: blobName.split('/').pop() as string, contentType: 'application/octet-stream' }
      ], projectId).then(res => res[0].uploadUrl)
      uploads.push({ filename, uploadUrl })
    }

    return NextResponse.json({ uploads })
  } catch (error: any) {
    console.error('attachments sas error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}


