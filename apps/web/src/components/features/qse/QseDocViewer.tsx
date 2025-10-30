'use client'

import React from 'react'

type Props = {
  docId: string
}

export default function QseDocViewer({ docId }: Props) {
  const [html, setHtml] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await fetch(`/api/v1/qse/docs/${encodeURIComponent(docId)}/fetch`, { cache: 'no-store' })
        if (!mounted) return
        if (!res.ok) {
          setError(`Failed to load document (${res.status})`)
          setHtml('')
          return
        }
        const json = await res.json()
        const contentHtml: string = (json?.content?.html as string) || (json?.content?.body as string) || ''
        setHtml(contentHtml || '')
      } catch (e: any) {
        if (!mounted) return
        setError('Failed to load document')
        setHtml('')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [docId])

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!html) return <div className="text-sm text-muted-foreground">No content yet.</div>

  // Parent container applies prose styles; add scoped class for table/spacing styles
  return <div className="qse-document" dangerouslySetInnerHTML={{ __html: html }} />
}

