'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Save, GitCommit, Send, X, Loader2 } from 'lucide-react'

type Props = {
  projectId: string
  planType: 'pqp' | 'emp' | 'ohsmp' | 'tmp'
  revisionElId?: string
  approvalStateElId?: string
  onSaved?: () => void
  onClose?: () => void
}

export default function PlanDocEditor({ projectId, planType, revisionElId, approvalStateElId, onSaved, onClose }: Props) {
  const [value, setValue] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [hasApprovedBaseline, setHasApprovedBaseline] = React.useState<boolean>(false)
  const [approvalState, setApprovalState] = React.useState<string>('not_required')
  const TinyMCEEditor = React.useMemo(
    () =>
      dynamic<any>(
        () =>
          import('@tinymce/tinymce-react').then(
            (m) => m.Editor as unknown as React.ComponentType<any>
          ),
        { ssr: false }
      ),
    []
  )

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const [docRes, metaRes] = await Promise.all([
        fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/fetch`),
        fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/meta`, { cache: 'no-store' }),
      ])
      if (!mounted) return
      if (docRes.ok) {
        const json = await docRes.json()
        setValue((json?.content?.html as string) || (json?.content?.body as string) || '')
      }
      if (metaRes.ok) {
        const m = await metaRes.json()
        setHasApprovedBaseline(!!m?.hasApprovedBaseline)
        setApprovalState(m?.approvalState || 'not_required')
      }
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [projectId, planType])

  const onSave = async () => {
    setSaving(true)
    await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: value }),
    })
    setSaving(false)
    onSaved?.()
    onClose?.()
  }

  const onCommit = async () => {
    setSaving(true)
    const endpoint = hasApprovedBaseline
      ? `/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/submit`
      : `/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/commit`
    await fetch(endpoint, { method: 'POST' })
    // After committing, refresh meta and update header fields if IDs were provided
    try {
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/meta`, { cache: 'no-store' })
      if (res.ok) {
        const m = await res.json()
        if (revisionElId) {
          const revEl = document.getElementById(revisionElId)
          if (revEl) revEl.textContent = m?.revisionIdentifier || 'A'
        }
        if (approvalStateElId) {
          const el = document.getElementById(approvalStateElId)
          if (el) {
            if (m?.approvalState === 'pending_review') {
              el.textContent = ' - Submitted for approval'
              el.classList.remove('hidden')
            } else {
              el.textContent = ''
              el.classList.add('hidden')
            }
          }
        }
        // Approver display removed from header; no update required
        setHasApprovedBaseline(!!m?.hasApprovedBaseline)
        setApprovalState(m?.approvalState || 'not_required')
      }
    } catch {}
    setSaving(false)
    onSaved?.()
    onClose?.()
  }

  const onSubmitForApproval = async () => {
    setSaving(true)
    try {
      await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/submit`, { method: 'POST' })
      const res = await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planType)}/meta`, { cache: 'no-store' })
      if (res.ok) {
        const m = await res.json()
        if (revisionElId) {
          const revEl = document.getElementById(revisionElId)
          if (revEl) revEl.textContent = m?.revisionIdentifier || 'A'
        }
        if (approvalStateElId) {
          const el = document.getElementById(approvalStateElId)
          if (el) {
            if (m?.approvalState === 'pending_review') {
              el.textContent = ' - Submitted for approval'
              el.classList.remove('hidden')
            } else {
              el.textContent = ''
              el.classList.add('hidden')
            }
          }
        }
        setHasApprovedBaseline(!!m?.hasApprovedBaseline)
        setApprovalState(m?.approvalState || 'not_required')
      }
    } catch {}
    setSaving(false)
    onSaved?.()
    onClose?.()
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>
  return (
    <div className="space-y-2">
      <div className="sticky top-0 z-10 border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 py-2 rounded">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button size="sm" onClick={onSave} disabled={saving} title="Save (Ctrl/Cmd+S)">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            {!hasApprovedBaseline && (
              <Button size="sm" variant="secondary" onClick={onCommit} disabled={saving} title={'Commit new revision'}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GitCommit className="mr-2 h-4 w-4" />
                )}
                Commit Revision
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={onSubmitForApproval} disabled={saving} title={hasApprovedBaseline ? 'Submit changes for client approval' : 'Submit for client approval'}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {hasApprovedBaseline ? 'Submit Changes for Approval' : 'Submit for Approval'}
            </Button>
          </div>
          <div>
            <Button size="sm" variant="outline" onClick={() => onClose?.()} disabled={saving} title="Close editor">
              <X className="mr-2 h-4 w-4" />
              Close Editor
            </Button>
          </div>
        </div>
      </div>

      {TinyMCEEditor && (
        <TinyMCEEditor
          tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
          value={value}
          onEditorChange={(content: string) => setValue(content)}
          init={{
            height: 2400,
            menubar: 'file edit view insert format table tools help',
            plugins: 'table lists link code',
            toolbar:
              'undo redo | styles | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | table | code',
            license_key: 'gpl',
            valid_elements: '*[*]',
            content_style: `
              body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
              table{border-collapse:collapse;width:100%}
              thead{background:#f9fafb}
              th,td{border:1px solid #d1d5db;padding:0.5rem;vertical-align:top}
              ul{margin:0;padding-left:1.25rem}
              h1,h2,h3{margin:0.5rem 0}
            `,
            readonly: false,
            promotion: false,
            branding: false,
          }}
        />
      )}
    </div>
  )
}
