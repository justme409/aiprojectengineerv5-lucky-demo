import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check user's subscription status
    const result = await pool.query(`
      SELECT status, plan_name, current_period_end, cancel_at_period_end
      FROM public.user_subscriptions
      WHERE user_id = $1
    `, [userId])

    if (result.rows.length === 0) {
      return NextResponse.json({
        subscription: {
          status: 'inactive'
        }
      })
    }

    const subscription = result.rows[0]
    return NextResponse.json({
      subscription: {
        status: subscription.status,
        plan_name: subscription.plan_name,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}