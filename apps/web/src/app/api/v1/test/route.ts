import { NextResponse } from 'next/server'
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
      SELECT p.*, o.name as organization_name
      FROM public.projects p
      JOIN public.organizations o ON o.id = p.organization_id
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id AND ou.user_id = $1
      ORDER BY p.created_at DESC
    `, [userId])

    return NextResponse.json({
      success: true,
      user_id: userId,
      projects_count: result.rows.length,
      projects: result.rows,
      message: 'Database connection and authentication working correctly'
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
