import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

// Helpers
async function assertProjectAccess(projectId: string, userId: string) {
  // Allow if org member or explicit project member
  const orgAccess = await pool.query(
    `SELECT 1 FROM public.projects p
     JOIN public.organization_users ou ON ou.organization_id = p.organization_id
     WHERE p.id = $1 AND ou.user_id = $2`,
    [projectId, userId]
  )
  if (orgAccess.rows.length > 0) return true
  const projAccess = await pool.query(
    `SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2`,
    [projectId, userId]
  )
  return projAccess.rows.length > 0
}

async function assertProjectManage(projectId: string, userId: string) {
  // Require permissions contains 'settings' or 'admin' OR org membership (admin implied at org level)
  const member = await pool.query(
    `SELECT permissions FROM public.project_members WHERE project_id=$1 AND user_id=$2`,
    [projectId, userId]
  )
  if (member.rows.length > 0) {
    const perms: string[] = member.rows[0].permissions || []
    if (perms.includes('settings') || perms.includes('admin')) return true
  }
  const orgAccess = await pool.query(
    `SELECT 1 FROM public.projects p
     JOIN public.organization_users ou ON ou.organization_id = p.organization_id
     WHERE p.id = $1 AND ou.user_id = $2`,
    [projectId, userId]
  )
  return orgAccess.rows.length > 0
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { projectId } = await params
    const userId = (session.user as any).id
    const ok = await assertProjectAccess(projectId, userId)
    if (!ok) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const q = `
      SELECT pm.id, pm.user_id, u.email, pm.role_id, pm.permissions
      FROM public.project_members pm
      LEFT JOIN auth.users u ON u.id = pm.user_id
      WHERE pm.project_id = $1
      ORDER BY u.email NULLS LAST
    `
    const { rows } = await pool.query(q, [projectId])
    return NextResponse.json({ members: rows })
  } catch (e) {
    console.error('team GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const client = await pool.connect()
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { projectId } = await params
    const userId = (session.user as any).id
    const can = await assertProjectManage(projectId, userId)
    if (!can) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const email = (body?.email || '').toLowerCase().trim()
    const permissions: string[] = Array.isArray(body?.permissions) ? body.permissions : ['read']
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    await client.query('BEGIN')
    // Find or create user
    const u = await client.query(`SELECT id FROM auth.users WHERE lower(email)=lower($1) LIMIT 1`, [email])
    let targetUserId: string
    if (u.rows.length === 0) {
      const ins = await client.query(`INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), $1) RETURNING id`, [email])
      targetUserId = ins.rows[0].id
    } else {
      targetUserId = u.rows[0].id
    }

    // Upsert membership
    await client.query(
      `INSERT INTO public.project_members (id, project_id, user_id, role_id, permissions)
       VALUES (gen_random_uuid(), $1, $2, NULL, $3::text[])
       ON CONFLICT (project_id, user_id)
       DO UPDATE SET permissions = EXCLUDED.permissions, updated_at = now()`,
      [projectId, targetUserId, permissions]
    )

    await client.query('COMMIT')
    return NextResponse.json({ success: true })
  } catch (e) {
    try { await client.query('ROLLBACK') } catch {}
    console.error('team POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    try { client.release() } catch {}
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { projectId } = await params
    const userId = (session.user as any).id
    const can = await assertProjectManage(projectId, userId)
    if (!can) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const memberId: string | undefined = body?.id
    const email: string | undefined = body?.email
    const permissions: string[] | undefined = body?.permissions
    if (!memberId && !email) return NextResponse.json({ error: 'id or email required' }, { status: 400 })

    let whereUserId: string | null = null
    if (email) {
      const u = await pool.query(`SELECT id FROM auth.users WHERE lower(email)=lower($1)`, [email])
      whereUserId = u.rows[0]?.id || null
      if (!whereUserId) return NextResponse.json({ error: 'user not found' }, { status: 404 })
    }

    if (permissions) {
      if (memberId) {
        await pool.query(`UPDATE public.project_members SET permissions=$1::text[], updated_at=now() WHERE id=$2 AND project_id=$3`, [permissions, memberId, projectId])
      } else if (whereUserId) {
        await pool.query(`UPDATE public.project_members SET permissions=$1::text[], updated_at=now() WHERE project_id=$2 AND user_id=$3`, [permissions, projectId, whereUserId])
      }
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('team PUT error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { projectId } = await params
    const userId = (session.user as any).id
    const can = await assertProjectManage(projectId, userId)
    if (!can) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get('id')
    const email = searchParams.get('email')
    if (!memberId && !email) return NextResponse.json({ error: 'id or email required' }, { status: 400 })
    if (memberId) {
      await pool.query(`DELETE FROM public.project_members WHERE id=$1 AND project_id=$2`, [memberId, projectId])
    } else if (email) {
      const u = await pool.query(`SELECT id FROM auth.users WHERE lower(email)=lower($1)`, [email.toLowerCase()])
      const uid = u.rows[0]?.id
      if (!uid) return NextResponse.json({ error: 'user not found' }, { status: 404 })
      await pool.query(`DELETE FROM public.project_members WHERE project_id=$1 AND user_id=$2`, [projectId, uid])
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('team DELETE error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

