import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get system debug information
    const dbHealth = await pool.query('SELECT 1 as health_check')
    const userInfo = {
      id: (session.user as any).id,
      email: session.user.email,
      name: session.user.name
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      user: userInfo,
      database: {
        connected: dbHealth.rows.length > 0,
        pool: {
          totalCount: (pool as any).totalCount,
          idleCount: (pool as any).idleCount,
          waitingCount: (pool as any).waitingCount
        }
      },
      environment: {
        node_env: process.env.NODE_ENV,
        nextauth_url: process.env.NEXTAUTH_URL,
        has_stripe_key: !!process.env.STRIPE_SECRET_KEY,
        has_azure_config: !!(process.env.AZURE_STORAGE_ACCOUNT && process.env.AZURE_STORAGE_KEY)
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: 'Debug API failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'clear_cache':
        // Clear any caches
        return NextResponse.json({ message: 'Cache cleared' })
      case 'reset_user_session':
        // Reset user session data
        return NextResponse.json({ message: 'User session reset' })
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Debug API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}