import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

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

    // Check access to project
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get run details from database
    const runResult = await pool.query(`
      SELECT pr.*
      FROM public.processing_runs pr
      WHERE pr.run_uid = $1 AND pr.project_id = $2
    `, [runId, projectId])

    if (runResult.rows.length === 0) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    const run = runResult.rows[0]

    // Connect to LangGraph Server (2024) for real-time streaming
    const LANGGRAPH_BASE_URL = process.env.LANGGRAPH_API_URL || 'http://localhost:2024'

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the run status from LangGraph 2024 via threads GET stream
          const response = await fetch(`${LANGGRAPH_BASE_URL}/threads/${encodeURIComponent(run.thread_id)}/runs/${encodeURIComponent(run.run_id)}/stream`, {
            headers: {
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache'
            }
          })

          if (!response.ok) {
            throw new Error(`LangGraph streaming failed: ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body reader available')
          }

          const decoder = new TextDecoder()
          let buffer = ''

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')

              // Keep the last incomplete line in buffer
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const eventData = JSON.parse(line.slice(6))
                    // Transform LangGraph events to our expected format
                    const transformedEvent = transformLangGraphEvent(eventData, runId)
                    if (transformedEvent) {
                      controller.enqueue(`data: ${JSON.stringify(transformedEvent)}\n\n`)
                    }
                  } catch (parseError) {
                    console.warn('Failed to parse LangGraph event:', line, parseError)
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }

          // Send completion event
          controller.enqueue(`data: ${JSON.stringify({
            event: 'complete',
            data: {
              run_id: runId,
              status: 'completed',
              final_output: { message: 'Processing completed' }
            }
          })}\n\n`)

          controller.enqueue('data: [DONE]\n\n')
          controller.close()

        } catch (streamError) {
          console.error('Streaming error:', streamError)

          // Send error event
          controller.enqueue(`data: ${JSON.stringify({
            event: 'error',
            data: {
              run_id: runId,
              error: 'Streaming failed',
              message: (streamError as any)?.message || 'Unknown error'
            }
          })}\n\n`)

          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Error streaming AI events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Transform LangGraph events to our expected format
function transformLangGraphEvent(langGraphEvent: any, runId: string) {
  // Handle different LangGraph event types
  if (langGraphEvent.event === 'start') {
    return {
      event: 'start',
      data: {
        run_id: runId,
        status: 'running'
      }
    }
  }

  if (langGraphEvent.event === 'end') {
    return {
      event: 'complete',
      data: {
        run_id: runId,
        status: 'completed',
        final_output: langGraphEvent.data || {}
      }
    }
  }

  if (langGraphEvent.event === 'chunk') {
    // Transform node execution events
    const nodeName = langGraphEvent.data?.node || 'unknown'
    const status = langGraphEvent.data?.status || 'running'

    if (status === 'running') {
      return {
        event: 'node_start',
        data: {
          node: nodeName,
          status: 'running'
        }
      }
    } else if (status === 'completed') {
      return {
        event: 'node_complete',
        data: {
          node: nodeName,
          status: 'completed',
          output: langGraphEvent.data?.output || {}
        }
      }
    }
  }

  // Return null for unrecognized events
  return null
}