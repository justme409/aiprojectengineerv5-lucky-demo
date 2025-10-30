import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { pool } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT user_id FROM public.user_subscriptions WHERE stripe_customer_id = $1',
    [customerId]
  )
  return result.rows[0]?.user_id || null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = (await headers()).get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  try {
    // Create or update subscription record
    await pool.query(`
      INSERT INTO public.user_subscriptions (
        user_id, stripe_customer_id, stripe_subscription_id, status,
        current_period_start, current_period_end, plan_name
      ) VALUES (
        $1, $2, $3, 'active',
        to_timestamp($4), to_timestamp($5), $6
      ) ON CONFLICT (user_id) DO UPDATE SET
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        status = 'active',
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = now()
    `, [
      userId,
      session.customer,
      session.subscription,
      null,
      null,
      'pro' // You might want to determine this from the session
    ])

    console.log(`User ${userId} subscription activated`)
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const userId = await getUserIdFromCustomer(invoice.customer as string)
    if (!userId) return

    // Update subscription period
    await pool.query(`
      UPDATE public.user_subscriptions
      SET current_period_start = to_timestamp($1),
          current_period_end = to_timestamp($2),
          status = 'active',
          updated_at = now()
      WHERE user_id = $3
    `, [invoice.period_start, invoice.period_end, userId])

    console.log(`User ${userId} payment succeeded`)
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = await getUserIdFromCustomer(subscription.customer as string)
    if (!userId) return

    // Mark subscription as cancelled
    await pool.query(`
      UPDATE public.user_subscriptions
      SET status = 'cancelled',
          cancelled_at = now(),
          updated_at = now()
      WHERE user_id = $1
    `, [userId])

    console.log(`User ${userId} subscription cancelled`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}