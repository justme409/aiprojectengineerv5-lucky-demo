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
    const { blobPath } = body

    if (!blobPath) {
      return NextResponse.json({ error: 'Blob path required' }, { status: 400 })
    }

    if (!azureStorage.isConfigured()) {
      return NextResponse.json({ error: 'Azure storage not configured' }, { status: 500 })
    }

    const downloadUrl = await azureStorage.getDownloadUrl(blobPath, 60) // 60 minutes expiry

    return NextResponse.json({ downloadUrl })
  } catch (error) {
    console.error('Error generating download URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
