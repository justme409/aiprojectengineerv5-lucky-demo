import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      message: 'Protected endpoint accessed successfully',
      user: {
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Protected test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}