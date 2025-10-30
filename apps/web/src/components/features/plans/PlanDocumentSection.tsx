'use client'

import React from 'react'
import { Edit2, FileDown, ChevronDown, ChevronUp } from 'lucide-react'
import PlanDocViewer from '@/components/features/plans/PlanDocViewer'
import PlanDocEditor from '@/components/features/plans/PlanDocEditor'

type Props = {
  projectId: string
  planType: 'pqp' | 'emp' | 'ohsmp' | 'tmp'
  title: string
  description?: string
  defaultExpanded?: boolean
}

export default function PlanDocumentSection(props: Props) {
  const { projectId, planType, title, description, defaultExpanded = false } = props
  const [expanded, setExpanded] = React.useState<boolean>(defaultExpanded)
  const [isEditing, setIsEditing] = React.useState<boolean>(false)
  const [refreshToken, setRefreshToken] = React.useState<number>(0)
  const [meta, setMeta] = React.useState<{
    revisionIdentifier: string
    approvalState: string
  }>({ revisionIdentifier: 'A', approvalState: 'not_required' })

  const revisionElId = React.useMemo(
    () => `plan-${projectId}-${planType}-revision`,
    [projectId, planType]
  )
  const approvalStateElId = React.useMemo(
    () => `plan-${projectId}-${planType}-approval-state`,
    [projectId, planType]
  )
  // Approver display removed from header per UX request

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/meta`, {
          cache: 'no-store',
        })
        if (!mounted) return
        if (res.ok) {
          const m = await res.json()
          setMeta({
            revisionIdentifier: m?.revisionIdentifier || 'A',
            approvalState: m?.approvalState || 'not_required',
          })
        }
      } catch {}
    })()
    return () => { mounted = false }
  }, [projectId, planType])

  return (
    <section className="scroll-mt-8">
      <div className="bg-white border border-slate-300">
        <div
          className="px-6 py-4 cursor-pointer border-b hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded((v) => !v)}
          role="button"
          aria-expanded={expanded}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              {description ? (
                <p className="text-gray-700 mt-1">{description}</p>
              ) : null}
            </div>
            <div className="ml-4 shrink-0 flex items-center gap-2 text-slate-500">
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="p-8 prose prose-slate max-w-none">
            <div className="flex items-start justify-between mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm w-full">
                <div className="border p-3">
                  <span className="font-semibold">Plan:</span>{' '}
                  {title}
                </div>
                <div className="border p-3">
                  <span className="font-semibold">Revision:</span>{' '}
                  <span id={revisionElId}>{meta.revisionIdentifier}</span>
                  <span
                    id={approvalStateElId}
                    className={meta.approvalState === 'pending_review' ? 'ml-1 text-xs' : 'hidden'}
                  >
                    {' - Submitted for approval'}
                  </span>
                </div>
              </div>
              <div className="ml-4 shrink-0 flex items-center gap-2">
                <button
                  className="h-8 w-8 flex items-center justify-center border rounded"
                  title={isEditing ? 'Close Editor' : 'Edit'}
                  onClick={() => setIsEditing((v) => !v)}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <a
                  className="h-8 w-8 flex items-center justify-center border rounded"
                  title="Export DOCX"
                  href={`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/export`}
                >
                  <FileDown className="h-4 w-4" />
                </a>
              </div>
            </div>

            {isEditing ? (
              <PlanDocEditor
                projectId={projectId}
                planType={planType}
                revisionElId={revisionElId}
                approvalStateElId={approvalStateElId}
                onSaved={() => {
                  setIsEditing(false)
                  setRefreshToken((v) => v + 1)
                }}
                onClose={() => setIsEditing(false)}
              />
            ) : (
              <PlanDocViewer projectId={projectId} planType={planType} refreshToken={refreshToken} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

  
