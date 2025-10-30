'use client'

import React from 'react'
import { Edit2, FileDown, ChevronDown, ChevronUp } from 'lucide-react'
import QseDocViewer from '@/components/features/qse/QseDocViewer'
import QseDocEditor from '@/components/features/qse/QseDocEditor'

type QseDocumentSectionProps = {
  sectionId?: string
  docId: string
  title: string
  description?: string
  /** Whether the accordion section is expanded by default */
  defaultExpanded?: boolean
  /** Optional override for the displayed Document ID (defaults to docId) */
  displayDocumentId?: string
}

/**
 * Standard expandable QSE document section with unified header, meta grid,
 * edit/export controls and Viewer/Editor toggle.
 *
 * - Uses TinyMCE-based QseDocEditor (Quill replaced) for editing
 * - Shows live Revision/Approver via /api/v1/qse/docs/[docId]/meta
 * - Editor commit updates meta fields in-place via element IDs
 */
export default function QseDocumentSection(props: QseDocumentSectionProps) {
  const {
    sectionId,
    docId,
    title,
    description,
    defaultExpanded = true,
    displayDocumentId,
  } = props

  const [expanded, setExpanded] = React.useState<boolean>(defaultExpanded)
  const [isEditing, setIsEditing] = React.useState<boolean>(false)
  const [meta, setMeta] = React.useState<{
    revisionIdentifier: string
    approverName: string | null
    approvedAt: string | null
  }>({ revisionIdentifier: 'A', approverName: null, approvedAt: null })

  const revisionElId = React.useMemo(
    () => `qse-${docId.replace(/[^a-zA-Z0-9_-]/g, '_')}-revision`,
    [docId]
  )
  const approverElId = React.useMemo(
    () => `qse-${docId.replace(/[^a-zA-Z0-9_-]/g, '_')}-approver`,
    [docId]
  )

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/v1/qse/docs/${encodeURIComponent(docId)}/meta`, {
          cache: 'no-store',
        })
        if (!mounted) return
        if (res.ok) {
          const m = await res.json()
          setMeta({
            revisionIdentifier: m?.revisionIdentifier || 'A',
            approverName: m?.approverName ?? null,
            approvedAt: m?.approvedAt ?? null,
          })
        }
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [docId])

  return (
    <section id={sectionId} className="scroll-mt-8">
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
              <div className="grid grid-cols-3 gap-4 text-sm w-full">
                <div className="border p-3">
                  <span className="font-semibold">Document ID:</span>{' '}
                  {displayDocumentId || docId}
                </div>
                <div className="border p-3">
                  <span className="font-semibold">Revision:</span>{' '}
                  <span id={revisionElId}>{meta.revisionIdentifier}</span>
                </div>
                <div className="border p-3">
                  <span className="font-semibold">Approver:</span>{' '}
                  <span id={approverElId}>
                    {meta.approverName
                      ? `${meta.approverName}${meta.approvedAt ? ` (${new Date(meta.approvedAt).toLocaleDateString()})` : ''}`
                      : '—'}
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
                  href={`/api/v1/qse/docs/${encodeURIComponent(docId)}/export`}
                >
                  <FileDown className="h-4 w-4" />
                </a>
              </div>
            </div>

            {isEditing ? (
              <QseDocEditor
                docId={docId}
                revisionElId={revisionElId}
                approverElId={approverElId}
              />
            ) : (
              <QseDocViewer docId={docId} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

