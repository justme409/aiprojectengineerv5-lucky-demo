'use client'
import React from 'react'
import dynamic from 'next/dynamic'
// Switched from Quill to TinyMCE for robust HTML/table editing
// Self-hosted TinyMCE to avoid Tiny Cloud API key prompt
// Using jsDelivr CDN for TinyMCE core and plugins (no API key required)

export default function QseDocEditor({ docId, revisionElId, approverElId }: { docId: string; revisionElId?: string; approverElId?: string }) {
  const [value, setValue] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
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
      const res = await fetch(`/api/v1/qse/docs/${encodeURIComponent(docId)}/fetch`)
      if (!mounted) return
      if (res.ok) {
        const json = await res.json()
        setValue((json?.content?.html as string) || (json?.content?.body as string) || '')
      }
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [docId])

  const onSave = async () => {
    setSaving(true)
    await fetch(`/api/v1/qse/docs/${encodeURIComponent(docId)}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: value }),
    })
    setSaving(false)
  }

  const onCommit = async () => {
    setSaving(true)
    await fetch(`/api/v1/qse/docs/${encodeURIComponent(docId)}/commit`, { method: 'POST' })
    // After committing, refresh meta and update header fields if IDs were provided
    try {
      const res = await fetch(`/api/v1/qse/docs/${encodeURIComponent(docId)}/meta`, { cache: 'no-store' })
      if (res.ok) {
        const m = await res.json()
        if (revisionElId) {
          const revEl = document.getElementById(revisionElId)
          if (revEl) revEl.textContent = m?.revisionIdentifier || 'A'
        }
        if (approverElId) {
          const apprEl = document.getElementById(approverElId)
          if (apprEl) {
            const name = m?.approverName || '—'
            const date = m?.approvedAt ? ` (${new Date(m.approvedAt).toLocaleDateString()})` : ''
            apprEl.textContent = `${name}${date}`
          }
        }
      }
    } catch {}
    setSaving(false)
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>
  return (
    <div className="space-y-2">
      {TinyMCEEditor && (
        <TinyMCEEditor
          tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
          value={value}
          onEditorChange={(content: string) => setValue(content)}
          init={{
            height: 520,
            menubar: 'file edit view insert format table tools help',
            plugins: 'table lists link code',
            toolbar:
              'undo redo | styles | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | table | code',
            license_key: 'gpl',
            // Preserve Tailwind class attributes and common attrs on elements
            valid_elements: '*[*]',
            // Improve table visibility within the editor iframe (Tailwind CSS not loaded there)
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
      <div className="flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={onSave} disabled={saving}>Save</button>
        <button className="px-3 py-1 border rounded" onClick={onCommit} disabled={saving}>Commit Revision</button>
      </div>
    </div>
  )
}

