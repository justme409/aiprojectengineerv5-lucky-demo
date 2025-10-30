import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, rawMime, messageId, inReplyTo, subject, participants } = body

    if (!projectId || !rawMime) {
      return NextResponse.json({ error: 'projectId and rawMime required' }, { status: 400 })
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

    // Parse email and create correspondence asset
    const emailContent = {
      message_id: messageId,
      in_reply_to: inReplyTo,
      subject,
      participants,
      raw_mime: rawMime,
      parsed_at: new Date().toISOString()
    }

    const spec = {
      asset: {
        type: 'email',
        name: subject || 'Email Correspondence',
        project_id: projectId,
        content: emailContent,
        status: 'received'
      },
      edges: [],
      idempotency_key: `email:${messageId}:${projectId}`,
      audit_context: { action: 'ingest_email', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)

    // Update or create correspondence thread
    const threadKey = generateThreadKey(messageId, inReplyTo)
    await pool.query(`
      INSERT INTO public.correspondence_threads (
        id, project_id, asset_id, thread_key, last_message_at, participants, metadata
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, now(), $4, $5
      ) ON CONFLICT (project_id, thread_key) DO UPDATE SET
        last_message_at = now(),
        participants = EXCLUDED.participants
    `, [projectId, result.id, threadKey, participants || [], { message_count: 1 }])

    return NextResponse.json({
      id: result.id,
      thread_key: threadKey,
      message: 'Email ingested successfully'
    })
  } catch (error) {
    console.error('Error ingesting email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateThreadKey(messageId: string, inReplyTo?: string): string {
  // Generate deterministic thread key from message IDs
  const ids = [messageId]
  if (inReplyTo) {
    ids.push(inReplyTo)
  }
  return ids.sort().join('|')
}