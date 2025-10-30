import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PlanApprovalActions from '@/components/features/plans/PlanApprovalActions'
import { getAssets } from '@/lib/actions/asset-actions'
import { getApprovalAuthority } from '@/lib/complianceAuthorities'

interface PageProps {
  params: Promise<{ projectId: string; planType: string }>
  searchParams?: Promise<{ assetId?: string }>
}

type RawAsset = {
  id: string
  name?: string | null
  subtype?: string | null
  content?: Record<string, any> | null
  status?: string | null
  approval_state?: string | null
  created_at?: string | null
  updated_at?: string | null
  revision_code?: string | null
  is_current?: boolean | null
}

type WorkflowAsset = RawAsset & {
  content?: {
    target_asset_id?: string
    status?: string
    current_step?: number
    workflow_definition?: unknown
    decision?: {
      decision?: string
      decided_by?: string
      decided_at?: string
      comment?: string | null
    }
  }
}

export default async function ManagementPlanDetailPage({ params, searchParams }: PageProps) {
  const { projectId, planType } = await params
  const sp = searchParams ? await searchParams : {}
  const preferredAssetId = sp?.assetId

  const plans = (await getAssets({ project_id: projectId, type: 'plan' })) as RawAsset[]
  const projectAssets = await getAssets({ project_id: projectId, type: 'project', limit: 1 })
  const projectAsset = projectAssets[0] as RawAsset | undefined
  const jurisdiction = projectAsset?.content?.jurisdiction || projectAsset?.content?.state_territory || null
  const approvalAuthority = getApprovalAuthority(jurisdiction)
  const selected = plans.find(asset => {
    if (preferredAssetId && asset.id === preferredAssetId) return true
    return asset.subtype === planType && asset.is_current
  })

  if (!selected) notFound()

  const html = selected.content?.html as string | undefined
  const revision = selected.revision_code || selected.content?.revision || selected.content?.revisionIdentifier || null
  const approvalState = selected.approval_state || selected.content?.approval_state || selected.status || 'draft'
  const updatedAt = selected.updated_at || selected.created_at || null
  const documentUrl = selected.content?.document_url || selected.content?.blob_url || null

  const approvalRequired = Boolean(selected.content?.approval_required) || approvalState === 'pending_review'
  const clientStatus: 'draft' | 'approved' | 'approval_required' | 'not_available' = (() => {
    const status = (approvalState || '').toLowerCase()
    if (status === 'approved') return 'approved'
    if (status === 'not_available') return 'not_available'
    if (approvalRequired || status === 'pending_review' || status === 'approval_required') return 'approval_required'
    return 'draft'
  })()

  const workflows = (await getAssets({ project_id: projectId, type: 'approval_workflow' })) as WorkflowAsset[]
  const planWorkflows = workflows
    .filter(workflow => workflow.content?.target_asset_id === selected.id)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

  const latestWorkflow = planWorkflows[0]
  const decisionHistory = planWorkflows
    .filter(w => w.content?.decision)
    .map(w => ({
      id: w.id,
      decidedAt: w.content?.decision?.decided_at || w.updated_at || w.created_at || null,
      decidedBy: w.content?.decision?.decided_by || null,
      decision: w.content?.decision?.decision || null,
      comment: w.content?.decision?.comment || null
    }))

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{selected.name || `${planType.toUpperCase()} Plan`}</h1>
            <p className="text-muted-foreground">Latest revision for client review</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/portal/projects/${projectId}/management-plans`}>Back to Management Plans</Link>
          </Button>
        </div>

        <PlanApprovalActions
          projectId={projectId}
          planType={planType}
          planAssetId={selected.id}
          planTitle={selected.name || `${planType.toUpperCase()} Plan`}
          workflowId={latestWorkflow?.id}
          workflowStatus={latestWorkflow?.content?.status || latestWorkflow?.status || 'pending'}
          decision={latestWorkflow?.content?.decision}
          history={decisionHistory}
          metadata={{
            status: approvalState,
            clientStatus,
            revision,
            updatedAt,
            documentUrl
          }}
          approvalAuthority={approvalAuthority}
        />

        <Card>
          <CardHeader>
            <CardTitle>Plan Content</CardTitle>
          </CardHeader>
          <CardContent>
            {html ? (
              <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="text-sm text-muted-foreground">No plan content available.</p>
            )}
          </CardContent>
        </Card>

        
      </div>
    </div>
  )
}
