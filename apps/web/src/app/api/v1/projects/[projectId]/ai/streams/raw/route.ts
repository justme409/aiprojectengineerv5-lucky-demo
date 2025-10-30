import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')

    if (!runId) {
      return NextResponse.json({ error: 'runId parameter required' }, { status: 400 })
    }

    // Raw LangGraph event streaming without processing
    const stream = new ReadableStream({
      start(controller) {
        const events = [
          { type: 'stream', event: 'on_chain_start', data: { run_id: runId } },
          { type: 'stream', event: 'on_chain_stream', data: { chunk: 'Processing documents...' } },
          { type: 'stream', event: 'on_chain_end', data: { output: { status: 'completed' } } }
        ]

        let index = 0
        const interval = setInterval(() => {
          if (index < events.length) {
            controller.enqueue(`${JSON.stringify(events[index])}\n`)
            index++
          } else {
            controller.close()
            clearInterval(interval)
          }
        }, 500)
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Error raw streaming AI events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}