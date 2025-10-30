import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 })
    }

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.organization_users
      WHERE organization_id = $1 AND user_id = $2
    `, [organizationId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await pool.query(
      `
        SELECT a.*
        FROM public.asset_heads a
        WHERE a.organization_id = $1
          AND (
            (a.document_number IS NOT NULL AND UPPER(a.document_number) LIKE 'QSE-%')
            OR (a.metadata->>'document_number') ILIKE 'QSE-%'
            OR (a.metadata->'qse_doc'->>'code') ILIKE 'QSE-%'
            OR UPPER(a.name) LIKE 'QSE-%'
          )
        ORDER BY
          a.document_number NULLS LAST,
          a.updated_at DESC
      `,
      [organizationId]
    )

    return NextResponse.json({ documents: result.rows })
  } catch (error) {
    console.error('Error fetching QSE documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organizationId, type, name, content } = body

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.organization_users
      WHERE organization_id = $1 AND user_id = $2
    `, [organizationId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await pool.query(`
      INSERT INTO public.assets (
        id, asset_uid, version, type, name, organization_id, content, status
      ) VALUES (
        gen_random_uuid(), gen_random_uuid(), 1, $1, $2, $3, $4, 'draft'
      ) RETURNING *
    `, [type, name, organizationId, content])

    return NextResponse.json({ document: result.rows[0] })
  } catch (error) {
    console.error('Error creating QSE document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
