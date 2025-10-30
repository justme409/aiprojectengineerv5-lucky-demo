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

    const result = await pool.query(`
      SELECT u.email, ou.organization_id, ou.role_id, r.name as role_name,
             ua.name, ua.content
      FROM auth.users u
      JOIN public.organization_users ou ON ou.user_id = u.id
      JOIN public.roles r ON r.id = ou.role_id
      LEFT JOIN public.asset_heads ua ON ua.type = 'user' AND ua.name = u.email::text
      WHERE u.id = $1
    `, [userId])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const user = result.rows[0]
    return NextResponse.json({
      success: true,
      profile: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role_name,
        organization_id: user.organization_id,
        content: user.content
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    // Update user asset
    const spec = {
      asset: {
        type: 'user',
        name: name || email?.split('@')[0] || 'User',
        content: {
          email,
          full_name: name,
          updated_at: new Date().toISOString()
        }
      },
      edges: [],
      idempotency_key: `update_user:${userId}`,
      audit_context: { action: 'update_user_profile', user_id: userId }
    }

    // Import the upsert function here to avoid circular dependencies
    const { upsertAssetsAndEdges } = await import('@/lib/actions/graph-repo')
    await upsertAssetsAndEdges(spec)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ success: false, error: 'Failed to update user profile' }, { status: 500 })
  }
}
