'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { ApprovalAuthorityInfo } from '@/lib/complianceAuthorities'

interface DecisionRecord {
  id: string
  decision: string | null
  decidedAt: string | null
  decidedBy: string | null
  comment: string | null
}

interface WorkflowDecision {
  decision?: string
  decided_at?: string
  decided_by?: string
  comment?: string | null
}

interface PlanApprovalActionsProps {
  projectId: string
  planType: string
  planAssetId: string
  planTitle: string
  workflowId?: string
  workflowStatus?: string | null
  decision?: WorkflowDecision | null
  history?: DecisionRecord[]
  metadata?: {
    status?: string | null
    clientStatus?: string
    revision?: string | null
    updatedAt?: string | null
    documentUrl?: string | null
  }
  approvalAuthority?: ApprovalAuthorityInfo
}

type DecisionType = 'approve' | 'reject'

type SubmitState = DecisionType | null

const toTitleCase = (value?: string | null) => {
  if (!value) return 'Pending review'
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^(\w)|\s(\w)/g, match => match.toUpperCase())
}

export default function PlanApprovalActions(props: PlanApprovalActionsProps) {
  const {
    projectId,
    planTitle,
    planAssetId,
    workflowId,
    workflowStatus,
    decision,
    history = [],
    metadata,
    approvalAuthority
  } = props

  const clientStatus = metadata?.clientStatus
  const [comment, setComment] = useState(() => decision?.comment || '')
  const [expanded, setExpanded] = useState<boolean>(() => (workflowId ? clientStatus !== 'approved' : false))
  const [submitState, setSubmitState] = useState<SubmitState>(null)
  const [creatingWorkflow, setCreatingWorkflow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localDecision, setLocalDecision] = useState<WorkflowDecision | null>(decision || null)
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | undefined>(workflowId)
  const status = useMemo(() => localDecision?.decision || decision?.decision || null, [localDecision?.decision, decision?.decision])
  const isCompleted = (workflowStatus ?? '').toLowerCase() === 'completed' || Boolean(status)
  const authorityRole = approvalAuthority?.role || 'Approving Authority'
  const authorityJurisdiction = approvalAuthority?.jurisdiction || 'GLOBAL'

  const formatDecisionSummary = useCallback((value?: string | null) => {
    if (!value) return `${authorityRole} review pending`
    if (value === 'approve') return `Approved by ${authorityRole}`
    if (value === 'reject') return `Revisions requested by ${authorityRole}`
    return toTitleCase(value)
  }, [authorityRole])

  const statusLabel = formatDecisionSummary(status)
  const toggleExpanded = () => setExpanded(prev => !prev)

  const ensureWorkflow = useCallback(async () => {
    if (activeWorkflowId) return activeWorkflowId
    if (!planAssetId) {
      throw new Error('Plan asset is not available for approval. Contact your project team.')
    }

    setCreatingWorkflow(true)
    try {
      const response = await fetch('/api/v1/approvals/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          name: `${planTitle} approval`,
          workflowDefinition: { steps: [] },
          targetAssetId: planAssetId
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
      setActiveWorkflowId(newWorkflowId)
      return newWorkflowId
    } finally {
      setCreatingWorkflow(false)
    }
  }, [activeWorkflowId, planAssetId, planTitle, projectId])

  const handleSubmit = async (type: DecisionType) => {
    const trimmedComment = comment.trim()

    if (type === 'reject' && trimmedComment.length === 0) {
      setError('Please add context so the project team understands the requested revisions.')
      setExpanded(true)
      return
    }

    setSubmitState(type)
    setError(null)
    setExpanded(true)

    try {
      const targetWorkflowId = await ensureWorkflow()
      const response = await fetch('/api/v1/approvals/workflows', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: targetWorkflowId,
          action: 'decide',
          decision: type,
          comment: trimmedComment.length > 0 ? trimmedComment : undefined
        })
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Unable to record your decision right now.')
      }

      setLocalDecision({
        decision: type,
        decided_at: new Date().toISOString(),
        comment: trimmedComment.length > 0 ? trimmedComment : null
      })
    } catch (err) {
      setExpanded(true)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to record your decision right now.')
      }
    } finally {
      setSubmitState(null)
    }
  }

  const combinedHistory = useMemo(() => {
    const base = history.map(record => ({ ...record }))

    if (activeWorkflowId && localDecision) {
      const idx = base.findIndex(record => record.id === activeWorkflowId)
      const next = {
        id: activeWorkflowId,
        decision: localDecision.decision || base[idx]?.decision || null,
        decidedAt: localDecision.decided_at || base[idx]?.decidedAt || null,
        decidedBy: localDecision.decided_by || base[idx]?.decidedBy || null,
        comment: localDecision.comment ?? base[idx]?.comment ?? null
      }
      if (idx >= 0) {
        base[idx] = next
      } else {
        base.unshift(next)
      }
      return base
    }

    if (!base.length && decision && activeWorkflowId) {
      return [{
        id: activeWorkflowId,
        decision: decision.decision || null,
        decidedAt: decision.decided_at || null,
        decidedBy: decision.decided_by || null,
        comment: decision.comment || null
      }]
    }

    return base
  }, [activeWorkflowId, decision, history, localDecision])

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{authorityRole} response</CardTitle>
            <CardDescription>
              Share the {authorityRole}&rsquo;s decision on “{planTitle}” and capture any context for the delivery team.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {clientStatus ? (
              <Badge
                className={
                  clientStatus === 'approved'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                    : clientStatus === 'approval_required'
                      ? 'border-amber-300 text-amber-700'
                      : 'bg-slate-200 text-slate-700'
                }
                variant={clientStatus === 'approval_required' ? 'outline' : 'secondary'}
              >
                {toTitleCase(clientStatus)}
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="flex items-center gap-1"
              aria-expanded={expanded}
            >
              {expanded ? 'Hide details' : 'Show details'}
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {expanded ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Status</div>
                <div className="mt-1 font-medium text-slate-900">{toTitleCase(metadata?.status || clientStatus || '—')}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Revision</div>
                <div className="mt-1 font-medium text-slate-900">{metadata?.revision || '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Authority</div>
                <div className="mt-1 font-medium text-slate-900">{authorityRole}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide">Jurisdiction</div>
                <div className="mt-1 font-medium text-slate-900">{authorityJurisdiction}</div>
              </div>
            </div>
            {metadata?.updatedAt ? (
              <p className="text-xs text-muted-foreground">
                Last updated {new Date(metadata.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            ) : null}
          </>
        ) : null}
      </CardHeader>
      {expanded ? (
        <CardContent className="space-y-6">
          {!activeWorkflowId ? (
            <div className="rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-muted-foreground">
              A decision will create an approval record for this plan and capture your response automatically.
            </div>
          ) : null}

          <>
            {metadata?.documentUrl ? (
              <div>
                <a
                  href={metadata.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Download latest revision
                </a>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="plan-feedback">Context for the delivery team</Label>
              <Textarea
                id="plan-feedback"
                placeholder="Add any conditions, requested revisions, or supporting notes."
                value={comment}
                onChange={event => setComment(event.target.value)}
                disabled={isCompleted}
                minLength={0}
                maxLength={4000}
                aria-describedby="plan-feedback-hint"
              />
              <p id="plan-feedback-hint" className="text-xs text-muted-foreground">
                Comments are optional when approving, but required when requesting revisions.
              </p>
            </div>

            {error ? (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleSubmit('approve')}
                disabled={isCompleted || submitState !== null || creatingWorkflow}
                size="lg"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {submitState === 'approve' || creatingWorkflow ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Approve as {authorityRole}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit('reject')}
                disabled={isCompleted || submitState !== null || creatingWorkflow}
                size="lg"
              >
                {submitState === 'reject' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Request revisions
              </Button>
            </div>

            {isCompleted ? (
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                Decision recorded: {statusLabel}.
              </div>
            ) : null}

            {combinedHistory.length ? (
              <div className="space-y-3">
                {combinedHistory.map(record => (
                  <div key={record.id} className="rounded border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {formatDecisionSummary(record.decision)}
                      </Badge>
                      {record.decidedAt ? (
                        <span className="text-muted-foreground">
                          {new Date(record.decidedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      ) : null}
                    </div>
                    {record.comment ? (
                      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{record.comment}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        </CardContent>
      ) : null}
    </Card>
  )
}
