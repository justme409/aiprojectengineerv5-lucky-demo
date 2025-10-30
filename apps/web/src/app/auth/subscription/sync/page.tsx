import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function handleSubscriptionSync() {
  try {
    const session = await auth()
    if (!session?.user) {
      redirect('/auth/login')
    }

    const userId = (session.user as any).id

    // Get user's current subscription from Stripe (placeholder - would use Stripe API)
    // This would typically be called from a Stripe webhook, but for manual sync we fetch current status

    // Update user subscription status in database
    await pool.query(`
      UPDATE public.user_subscriptions
      SET
        status = 'active',
        updated_at = NOW(),
        last_sync_at = NOW()
      WHERE user_id = $1
    `, [userId])

    return { success: true }
  } catch (error) {
    console.error('Subscription sync error:', error)
    return { success: false, error: 'Failed to sync subscription' }
  }
}

export default async function SubscriptionSyncPage() {
  const result = await handleSubscriptionSync()

  if (result.success) {
    redirect('/dashboard?sync=success')
  } else {
    redirect('/dashboard?sync=error')
  }
}
