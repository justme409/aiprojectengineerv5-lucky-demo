import { auth } from '@/lib/auth'
import { getProjectById } from '@/lib/actions/project-actions'
import { query } from '@/lib/db'
import ItpTemplateListClient from '@/components/features/project/ItpTemplateListClient'

/*
Developer commentary — ITP Templates Register

This page is the ITP Templates Register for a project. These are the AI‑generated, client‑controlled ITP templates that will be used repeatedly across the project whenever the relevant scope of work appears. For example, a template for “Concrete kerb construction” will be reused for each kerb lot or activity that requires it.

Key points for the flow (see LangGraph process and overall flow for full details):
- Only templates live here (the controlled, reusable documents), not per‑lot ITP instances.
- Templates are strictly controlled documents and must be approved by the client before use.
- Revision control applies — only approved revisions are valid for production use.
- When work is planned (via WBS or LBS), the system maps and files the appropriate templates for reuse, but this register remains the authoritative list of the templates themselves.
*/

type ItpTemplatesRegisterPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function ItpTemplatesRegisterPage({ params }: ItpTemplatesRegisterPageProps) {
  const { projectId } = await params
  const session = await auth()

  if (!session?.user) {
    throw new Error('Authentication required')
  }

  // Check if user has access to this project
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error('Project not found')
  }

  // Simple auth check - user must be the project creator
  if (project.created_by_user_id !== session.user.id) {
    throw new Error('Access denied')
  }

  // Fetch ITP templates for the project from asset_heads; include both template/doc types if stored together
  const { rows } = await query(
    `SELECT id, name, status, content, document_number
     FROM public.asset_heads
     WHERE project_id = $1 AND type IN ('itp_template','itp_document')
     ORDER BY updated_at DESC`,
    [projectId]
  )
  const templates = rows.map((t: any) => ({
    id: t.id,
    name: t.name,
    version: t.content?.version || null,
    status: t.status,
    document_number: t.document_number || null,
  }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">ITP Templates Register</h1>
      <ItpTemplateListClient templates={templates} projectId={projectId} />
    </div>
  )
}

export const revalidate = 0


