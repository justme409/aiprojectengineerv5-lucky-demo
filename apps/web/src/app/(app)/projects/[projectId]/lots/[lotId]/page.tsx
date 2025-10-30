import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getProjectById } from '@/lib/actions/project-actions'
import { getLotById, getItpTemplateById } from '@/lib/actions/lot-actions'
import ItpTemplateDetailClient from '@/components/features/itp/ItpTemplateDetailClient'

type LotDetailPageProps = {
  params: Promise<{
    projectId: string
    lotId: string
  }>
}

export default async function LotDetailPage({ params }: LotDetailPageProps) {
  const { projectId, lotId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/auth/login?message=auth_required&redirectTo=/projects/${projectId}/lots/${lotId}`)
  }

  // Check if user has access to this project
  const project = await getProjectById(projectId)
  if (!project) {
    notFound()
  }

  // Simple auth check - user must be the project creator
  if (project.created_by_user_id !== session.user.id) {
    notFound()
  }

  // Fetch lot details
  const lotResult = await getLotById(projectId, lotId)
  if (!lotResult.success || !lotResult.data) {
    notFound()
  }

  const lotAsset = lotResult.data
  const lot = {
    id: lotAsset.id,
    name: lotAsset.name || `Lot ${lotAsset.content?.lot_number}`,
    lot_number: lotAsset.content?.lot_number,
    status: lotAsset.status,
    description: lotAsset.content?.description,
    itp_document_asset_id: lotAsset.content?.itp_document_asset_id,
    lbs_node_asset_id: lotAsset.content?.lbs_node_asset_id,
    created_at: lotAsset.created_at,
    updated_at: lotAsset.updated_at
  }

  // Fetch associated ITP template if it exists
  let template = null
  if (lot.itp_document_asset_id) {
    const templateResult = await getItpTemplateById(lot.itp_document_asset_id)
    if (templateResult.success) {
      const templateAsset = templateResult.data
      template = {
        id: templateAsset.id,
        name: templateAsset.name,
        description: templateAsset.content?.description,
        version: templateAsset.content?.version || '1.0',
        status: templateAsset.status,
        items: templateAsset.content?.items || [],
        applicabilityNotes: templateAsset.content?.applicability_notes,
        createdAt: templateAsset.created_at,
        updatedAt: templateAsset.updated_at
      }
    }
  }

  return (
    <ItpTemplateDetailClient
      template={template}
      templateId={template?.id || lot.itp_document_asset_id || ''}
      lot={lot}
      projectId={projectId}
      lotId={lotId}
      projectName={project.name}
      isClientPortal={false}
    />
  )
}

export const revalidate = 0
