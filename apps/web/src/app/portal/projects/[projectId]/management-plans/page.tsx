'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Download, Loader2, FileWarning } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getApprovalAuthority, type ApprovalAuthorityInfo } from '@/lib/complianceAuthorities'

type PlanType = 'pqp' | 'emp' | 'ohsmp' | 'tmp'
type PlanStatus = 'draft' | 'approved' | 'pending_review' | 'not_available' | string
type ClientPlanStatus = 'draft' | 'approved' | 'approval_required' | 'not_available'
type PlanSource = 'placeholder' | 'aggregate' | 'asset'

type RawAsset = {
  id: string
  type?: string
  subtype?: string | null
  name?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  revision_code?: string | null
  content?: Record<string, any> | null
  metadata?: Record<string, any> | null
  approval_state?: string | null
  approved_by?: string | null
  approved_at?: string | null
  is_current?: boolean | null
}

type WorkflowAsset = {
  id: string
  status?: string | null
  content?: {
    target_asset_id?: string
    status?: string
    decision?: {
      decision?: string
      comment?: string | null
      decided_at?: string
      decided_by?: string
    }
  } | null
  updated_at?: string | null
  created_at?: string | null
}

interface ManagementPlan {
  id: string
  type: PlanType
  title: string
  description: string
  status: PlanStatus
  generatedAt: string | null
  documentUrl?: string | null
  approvalRequired: boolean
  approvedBy?: string | null
  approvedAt?: string | null
  assetId?: string
  revision?: string | null
  sectionCount?: number
  hasContent?: boolean
  source: PlanSource
  clientStatus: ClientPlanStatus
  workflowId?: string
  workflowStatus?: string | null
  workflowDecision?: string | null
}

const planTypes: Record<PlanType, { title: string; description: string }> = {
  pqp: {
    title: 'Quality Management Plan',
    description: 'Quality assurance, controls, and inspection requirements.'
  },
  emp: {
    title: 'Environmental Management Plan',
    description: 'Environmental obligations, controls, and monitoring.'
  },
  ohsmp: {
    title: 'Health & Safety Management Plan',
    description: 'Risk controls, safe work systems, and health procedures.'
  },
  tmp: {
    title: 'Traffic Management Plan',
    description: 'Traffic staging, temporary works, and road-user safety.'
  }
}

const PLAN_TYPE_KEYS = Object.keys(planTypes) as PlanType[]
const PLAN_TYPE_SET = new Set<PlanType>(PLAN_TYPE_KEYS)

const SOURCE_PRIORITY: Record<PlanSource, number> = {
  placeholder: 0,
  aggregate: 1,
  asset: 2
}

const buildPlaceholderPlan = (type: PlanType): ManagementPlan => ({
  id: `placeholder-${type}`,
  type,
  title: planTypes[type].title,
  description: planTypes[type].description,
  status: 'not_available',
  generatedAt: null,
  documentUrl: null,
  approvalRequired: false,
  approvedBy: null,
  approvedAt: null,
  assetId: undefined,
  revision: null,
  sectionCount: undefined,
  hasContent: false,
  source: 'placeholder',
  clientStatus: 'not_available'
})

const toTimestamp = (value?: string | null): number => {
  if (!value) return 0
  const ts = new Date(value).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

const shouldReplacePlan = (current: ManagementPlan, next: ManagementPlan): boolean => {
  const currentPriority = SOURCE_PRIORITY[current.source]
  const nextPriority = SOURCE_PRIORITY[next.source]

  if (nextPriority > currentPriority) return true
  if (nextPriority < currentPriority) return false

  return toTimestamp(next.generatedAt) >= toTimestamp(current.generatedAt)
}

const isKnownPlanType = (value: string | null | undefined): value is PlanType => {
  if (!value) return false
  const normalized = value.toLowerCase() as PlanType
  return PLAN_TYPE_SET.has(normalized)
}

const normalizePlanType = (...candidates: Array<string | null | undefined>): PlanType | null => {
  for (const candidate of candidates) {
    if (!candidate) continue
    const normalised = candidate.toLowerCase()
    if (isKnownPlanType(normalised)) {
      return normalised
    }
  }
  return null
}

const deriveClientStatus = (assetStatus: PlanStatus, approvalRequired: boolean): ClientPlanStatus => {
  const status = typeof assetStatus === 'string' ? assetStatus.toLowerCase() : ''

  if (status === 'approved') {
    return 'approved'
  }

  if (approvalRequired || status === 'pending_review' || status === 'approval_required') {
    return 'approval_required'
  }

  if (status === 'not_available') {
    return 'not_available'
  }

  return 'draft'
}

const buildPlanFromAsset = (type: PlanType, asset: RawAsset): ManagementPlan => {
  const generatedAt = asset.updated_at || asset.created_at || null
  const documentUrl =
    asset.content?.document_url ||
    asset.content?.blob_url ||
    asset.content?.docx_url ||
    asset.content?.plan_url ||
    null

  const sectionCount = Array.isArray(asset.content?.items)
    ? asset.content?.items.length
    : Array.isArray(asset.content?.sections)
      ? asset.content?.sections.length
      : undefined

  const revision =
    asset.revision_code ||
    asset.content?.revision ||
    asset.content?.revisionIdentifier ||
    asset.content?.metadata?.revision ||
    null

  const hasContent = Boolean(
    asset.content?.html ||
    asset.content?.plan_html ||
    (Array.isArray(asset.content?.sections) && asset.content?.sections.length > 0) ||
    (Array.isArray(asset.content?.items) && asset.content?.items.length > 0)
  )
  const approvalRequired = Boolean(asset.content?.approval_required) || asset.approval_state === 'pending_review'

  return {
    id: asset.id,
    type,
    title: asset.name || planTypes[type].title,
    description: asset.content?.description || planTypes[type].description,
    status: (asset.status as PlanStatus) || 'draft',
    generatedAt,
    documentUrl,
    approvalRequired,
    approvedBy: asset.content?.approved_by || asset.approved_by || asset.metadata?.approved_by || null,
    approvedAt: asset.content?.approved_at || asset.approved_at || asset.metadata?.approved_at || null,
    assetId: asset.id,
    revision,
    sectionCount,
    hasContent,
    source: 'asset',
    clientStatus: deriveClientStatus((asset.status as PlanStatus) || 'draft', approvalRequired)
  }
}

const buildPlanFromAggregateEntry = (type: PlanType, asset: RawAsset, entry: Record<string, any>): ManagementPlan => {
  const generatedAt = entry?.generated_at || asset.updated_at || asset.created_at || null
  const sectionCount = Array.isArray(entry?.plan_items) ? entry.plan_items.length : undefined
  const hasContent = Boolean(entry?.plan_html || entry?.html)
  const approvalRequired = Boolean(entry?.approval_required ?? asset.content?.approval_required)
  const status = (asset.status as PlanStatus) || 'draft'

  return {
    id: `${asset.id}:${type}`,
    type,
    title: entry?.plan_name || planTypes[type].title,
    description: planTypes[type].description,
    status,
    generatedAt,
    documentUrl: entry?.document_url || entry?.plan_url || asset.content?.document_url || null,
    approvalRequired,
    approvedBy: entry?.approved_by || asset.content?.approved_by || null,
    approvedAt: entry?.approved_at || asset.content?.approved_at || null,
    assetId: undefined,
    revision: entry?.revision || entry?.plan_revision || null,
    sectionCount,
    hasContent,
    source: 'aggregate',
    clientStatus: deriveClientStatus(status, approvalRequired)
  }
}

const transformAssetsToPlans = (assets: RawAsset[], workflowByAssetId?: Map<string, WorkflowAsset>): ManagementPlan[] => {
  const plansByType = new Map<PlanType, ManagementPlan>(
    PLAN_TYPE_KEYS.map(type => [type, buildPlaceholderPlan(type)])
  )

  assets.forEach(asset => {
    if (!asset || asset.type !== 'plan') return

    if (asset.subtype === 'management_plans' && Array.isArray(asset.content?.plans)) {
      asset.content?.plans.forEach((entry: Record<string, any>) => {
        const planType = normalizePlanType(entry?.plan_type)
        if (!planType) return
        const candidate = buildPlanFromAggregateEntry(planType, asset, entry)
        const existing = plansByType.get(planType)
        if (existing && shouldReplacePlan(existing, candidate)) {
          plansByType.set(planType, candidate)
        }
      })
      return
    }

    const planType = normalizePlanType(asset.subtype, asset.metadata?.plan_type, asset.content?.plan_type)
    if (!planType) return

    const candidate = buildPlanFromAsset(planType, asset)
    const existing = plansByType.get(planType)
    if (existing && shouldReplacePlan(existing, candidate)) {
      plansByType.set(planType, candidate)
    }
  })

  return PLAN_TYPE_KEYS.map(type => {
    const plan = plansByType.get(type) || buildPlaceholderPlan(type)
    if (workflowByAssetId && plan.assetId) {
      const workflow = workflowByAssetId.get(plan.assetId)
      if (workflow) {
        return {
          ...plan,
          workflowId: workflow.id,
          workflowStatus: workflow.content?.status || workflow.status || null,
          workflowDecision: workflow.content?.decision?.decision || null,
        }
      }
    }
    return plan
  })
}

const formatPlanDate = (value: string | null | undefined): string => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const renderStatusBadge = (status: ClientPlanStatus) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Approved</Badge>
    case 'approval_required':
      return <Badge variant="outline" className="border-amber-300 text-amber-700">Approval required</Badge>
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>
    case 'not_available':
    default:
      return <Badge variant="secondary" className="bg-slate-200 text-slate-700">Not available</Badge>
  }
}

const buildViewHref = (projectId: string, plan: ManagementPlan) => {
  const base = `/portal/projects/${projectId}/management-plans/${plan.type}`
  return plan.assetId ? `${base}?assetId=${plan.assetId}` : base
}

export default function ManagementPlansPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const [plans, setPlans] = useState<ManagementPlan[]>(() => PLAN_TYPE_KEYS.map(buildPlaceholderPlan))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quickSubmitting, setQuickSubmitting] = useState<string | null>(null)
  const [authority, setAuthority] = useState<ApprovalAuthorityInfo>(() => getApprovalAuthority())

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [planRes, workflowRes, complianceRes] = await Promise.all([
        fetch(`/api/v1/assets?projectId=${projectId}&type=plan`),
        fetch(`/api/v1/assets?projectId=${projectId}&type=approval_workflow`),
        fetch(`/api/v1/projects/${projectId}/compliance/config`)
      ])

      if (!planRes.ok) {
        throw new Error(`Failed to load plans: ${planRes.status}`)
      }

      const planPayload = await planRes.json()
      let workflowsPayload: { assets?: WorkflowAsset[] } = { assets: [] }
      if (workflowRes.ok) {
        workflowsPayload = await workflowRes.json()
      }

      if (complianceRes.ok) {
        const compliance = await complianceRes.json()
        const jurisdiction = compliance?.pack_content?.jurisdiction || compliance?.jurisdiction
        setAuthority(getApprovalAuthority(jurisdiction))
      } else {
        setAuthority(getApprovalAuthority())
      }

      const workflowMap = new Map<string, WorkflowAsset>()
      ;(workflowsPayload.assets || []).forEach(workflow => {
        const targetId = workflow.content?.target_asset_id
        if (targetId) {
          workflowMap.set(targetId, workflow)
        }
      })

      const transformed = transformAssetsToPlans((planPayload?.assets || []) as RawAsset[], workflowMap)
      setPlans(transformed)
    } catch (err) {
      console.error('Error fetching plans', err)
      setError('We could not load the latest plan status. Please retry or contact your project engineer if the issue persists.')
      setPlans(PLAN_TYPE_KEYS.map(buildPlaceholderPlan))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const ensureWorkflowForPlan = useCallback(async (plan: ManagementPlan): Promise<string> => {
    if (plan.workflowId) return plan.workflowId
    if (!plan.assetId) {
      throw new Error('Plan asset missing; open the plan to review before approving.')
    }

    const response = await fetch('/api/v1/approvals/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        name: `${plan.title} approval`,
        workflowDefinition: { steps: [] },
        targetAssetId: plan.assetId
      })
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload?.error || 'Unable to open an approval workflow for this plan.')
    }

    const payload = await response.json()
    const newWorkflowId = payload?.id as string | undefined
    if (!newWorkflowId) {
      throw new Error('Approval workflow creation did not return a workflow id.')
    }
    return newWorkflowId
  }, [projectId])

  const handleQuickApprove = useCallback(async (plan: ManagementPlan) => {
    try {
      if (!plan.assetId) {
        const href = buildViewHref(projectId, plan)
        router.push(href)
        return
      }

      const submittingKey = plan.assetId
      setQuickSubmitting(submittingKey)
      const workflowId = await ensureWorkflowForPlan(plan)
      const response = await fetch('/api/v1/approvals/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workflowId, action: 'decide', decision: 'approve' })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Unable to approve the plan right now.')
      }

      await fetchPlans()
    } catch (err) {
      console.error('Quick approve error', err)
      setError(`We could not approve the plan. Open the plan to try again with full context for the ${authority.role}.`)
    } finally {
      setQuickSubmitting(null)
    }
  }, [authority.role, ensureWorkflowForPlan, fetchPlans, projectId, router])

  const summary = useMemo(() => {
    const published = plans.filter(plan => plan.source !== 'placeholder' && plan.clientStatus !== 'not_available')
    const approved = published.filter(plan => plan.clientStatus === 'approved')
    const needsAttention = published.filter(plan => plan.clientStatus === 'approval_required')

    return {
      approvedCount: approved.length,
      needsAttention: needsAttention.length
    }
  }, [plans])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="space-y-6 animate-pulse">
            <div className="h-9 w-64 rounded bg-slate-200" />
            <div className="h-4 w-80 rounded bg-slate-200" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-28 rounded-lg border border-slate-200 bg-white" />
              <div className="h-28 rounded-lg border border-slate-200 bg-white" />
            </div>
            <div className="h-80 rounded-lg border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Management Plans</h1>
          <p className="text-slate-600">
            Current status of the management plan set generated from the project asset register.
          </p>
        </header>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load plans</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {summary.approvedCount} / {PLAN_TYPE_KEYS.length}
              </div>
              <p className="text-sm text-muted-foreground">Management plans released for project use</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Requires action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">{summary.needsAttention}</div>
              <p className="text-sm text-muted-foreground">Plans awaiting decision</p>
            </CardContent>
          </Card>
        </section>

        {!error && summary.approvedCount === 0 && summary.needsAttention === 0 ? (
          <Alert>
            <FileWarning className="h-5 w-5" />
            <AlertTitle>No plans published yet</AlertTitle>
            <AlertDescription>
              The management plan assets have not been released to the client portal. Once generated and approved, plans will appear here automatically.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Plan catalogue</CardTitle>
            <CardDescription>
              Track the authoritative plan records mapped directly from the asset table.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-44">Updated</TableHead>
                  <TableHead className="w-48 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map(plan => {
                  const canAccessPlan = plan.source === 'asset' && plan.clientStatus !== 'not_available'
                  const viewHref = canAccessPlan ? buildViewHref(projectId, plan) : '#'
                  const rowSubmittingKey = plan.assetId || plan.id
                  const isApproving = quickSubmitting === rowSubmittingKey

                  return (
                    <TableRow
                      key={plan.type}
                      className={canAccessPlan ? 'cursor-pointer hover:bg-slate-50' : ''}
                      role={canAccessPlan ? 'button' : undefined}
                      tabIndex={canAccessPlan ? 0 : undefined}
                      onClick={() => {
                        if (canAccessPlan) router.push(viewHref)
                      }}
                      onKeyDown={event => {
                        if (!canAccessPlan) return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          router.push(viewHref)
                        }
                      }}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-900">{plan.title}</div>
                          <div className="text-sm text-muted-foreground">{plan.description}</div>
                          {typeof plan.sectionCount === 'number' && plan.sectionCount > 0 ? (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {plan.sectionCount} sections captured
                            </div>
                          ) : null}
                          {plan.documentUrl ? (
                            <div className="mt-2 text-xs">
                              <a
                                href={plan.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                                onClick={event => event.stopPropagation()}
                              >
                                <Download className="h-3 w-3" />
                                Download revision
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(plan.clientStatus)}
                            {plan.revision ? (
                              <span className="text-xs font-mono uppercase text-muted-foreground">Rev {plan.revision}</span>
                            ) : null}
                          </div>
                          {plan.source === 'aggregate' ? (
                            <span className="text-xs text-muted-foreground">
                              Latest content staged in comprehensive plan set.
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span title={plan.generatedAt || undefined}>{formatPlanDate(plan.generatedAt)}</span>
                          {plan.approvedAt && plan.clientStatus === 'approved' ? (
                            <span className="text-xs text-muted-foreground">
                              Approved {formatPlanDate(plan.approvedAt)}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          disabled={plan.clientStatus === 'approved' || isApproving}
                          onClick={event => {
                            event.stopPropagation()
                            handleQuickApprove(plan)
                          }}
                        >
                          {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href={`/portal/projects/${projectId}/dashboard`}>
              Back to Project Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
