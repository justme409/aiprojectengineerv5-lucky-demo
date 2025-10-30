import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import HTMLtoDOCX from 'html-to-docx'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; planType: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, planType } = await params

    // Access check
    const accessCheck = await pool.query(
      `SELECT 1 FROM public.projects p
       JOIN public.organization_users ou ON ou.organization_id = p.organization_id
       WHERE p.id = $1 AND ou.user_id = $2`,
      [projectId, (session.user as any).id]
    )
    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await pool.query(
      `SELECT name, content FROM public.assets
       WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
       ORDER BY created_at DESC LIMIT 1`,
      [projectId, planType]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const asset = result.rows[0]
    const title: string = asset.name || `${String(planType).toUpperCase()} Plan`
    const content = asset.content as any
    const html: string = (content?.html as string) || ((content?.body as string) || '').replace(/\n/g, '<br/>')

    const buffer = await HTMLtoDOCX(
      `<h1>${title}</h1>${html}`,
      null,
      { table: { row: { cantSplit: true } }, footer: false, pageNumber: false }
    )

    const body = new Uint8Array(buffer)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9_-]+/g,'_')}.docx"`,
        'Content-Length': String(body.byteLength),
      },
    })
  } catch (error) {
    console.error('Error exporting plan document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




