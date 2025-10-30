import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent webhook processing status
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_webhooks,
        COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour') as last_hour,
        COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours') as last_24h
      FROM public.audit_events
      WHERE action LIKE '%webhook%'
    `)

    const stats = result.rows[0] || { total_webhooks: 0, last_hour: 0, last_24h: 0 }

    return NextResponse.json({
      status: 'operational',
      stats,
      last_check: new Date().toISOString()
    })
  } catch (error) {
    console.error('Webhook status error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}