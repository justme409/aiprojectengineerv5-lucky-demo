'use client'

import React from 'react'

type Props = {
  projectId: string
  planType: 'pqp' | 'emp' | 'ohsmp' | 'tmp'
  refreshToken?: number
}

export default function PlanDocViewer({ projectId, planType, refreshToken }: Props) {
  const [html, setHtml] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await fetch(`/api/v1/assets?projectId=${encodeURIComponent(projectId)}&type=plan`, { cache: 'no-store' })
        if (!mounted) return
        if (!res.ok) {
          setError(`Failed to load plan (${res.status})`)
          setHtml('')
          return
        }
        const json = await res.json()
        const assets: any[] = json?.assets || []
        const plan = assets.find((a) => a.subtype === planType)
        const contentHtml: string = (plan?.content?.html as string) || ''
        setHtml(contentHtml || '')
      } catch (e: any) {
        if (!mounted) return
        setError('Failed to load plan')
        setHtml('')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [projectId, planType, refreshToken])

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!html) return <div className="text-sm text-muted-foreground">No content yet.</div>

  return <div className="qse-document" dangerouslySetInnerHTML={{ __html: html }} />
}

