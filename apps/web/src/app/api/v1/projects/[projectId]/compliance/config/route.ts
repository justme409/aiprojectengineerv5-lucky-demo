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

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get compliance config
    const result = await pool.query(`
      SELECT pfc.*, a.name as pack_name, a.content as pack_content
      FROM public.project_feature_flags pfc
      LEFT JOIN public.assets a ON a.id = pfc.pack_asset_uid
      WHERE pfc.project_id = $1
    `, [projectId])

    if (result.rows.length === 0) {
      return NextResponse.json({
        jurisdiction: 'GLOBAL',
        pack_name: 'GLOBAL DEFAULT Compliance Pack v1.0.0',
        flags: { quality_module: true },
        pack_content: null
      })
    }

    const config = result.rows[0]
    return NextResponse.json({
      jurisdiction: config.pack_content?.jurisdiction || 'GLOBAL',
      pack_name: config.pack_name,
      flags: config.flags,
      pack_content: config.pack_content
    })
  } catch (error) {
    console.error('Error fetching compliance config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()
    const { jurisdiction, packId } = body

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update compliance pack binding
    await pool.query(`
      INSERT INTO public.project_feature_flags (project_id, pack_asset_uid, flags, updated_at)
      VALUES ($1, $2, (SELECT content->>'feature_flags_default' FROM public.assets WHERE id = $2)::jsonb, now())
      ON CONFLICT (project_id) DO UPDATE SET
        pack_asset_uid = EXCLUDED.pack_asset_uid,
        flags = EXCLUDED.flags,
        updated_at = now()
    `, [projectId, packId])

    // Update project settings with jurisdiction
    await pool.query(`
      UPDATE public.projects
      SET settings = jsonb_set(settings, '{jurisdiction}', $1::jsonb),
          updated_at = now()
      WHERE id = $2
    `, [JSON.stringify(jurisdiction), projectId])

    return NextResponse.json({ message: 'Compliance pack bound successfully' })
  } catch (error) {
    console.error('Error setting compliance config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()
    const { flags } = body

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update feature flags
    await pool.query(`
      UPDATE public.project_feature_flags
      SET flags = $1, updated_at = now()
      WHERE project_id = $2
    `, [flags, projectId])

    return NextResponse.json({ message: 'Feature flags updated' })
  } catch (error) {
    console.error('Error updating compliance config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}