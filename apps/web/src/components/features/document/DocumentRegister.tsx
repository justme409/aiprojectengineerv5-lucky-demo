'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Download, History } from 'lucide-react'

interface AssetHead {
  id: string
  asset_uid: string
  version: number
  is_current: boolean
  type: 'document' | 'drawing'
  subtype?: string
  name: string
  document_number?: string
  revision_code?: string
  status: string
  approval_state: string
  created_at: string
  updated_at: string
  content?: any
  metadata?: any
}

interface DocumentRegisterProps {
  projectId: string
  uploadButton?: React.ReactNode
}

export default function DocumentRegister({ projectId, uploadButton }: DocumentRegisterProps) {
  const [assets, setAssets] = useState<AssetHead[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const fetchAssets = useCallback(async () => {
    try {
      const [docsRes, drwRes] = await Promise.all([
        fetch(`/api/v1/assets?projectId=${projectId}&type=document&limit=500`),
        fetch(`/api/v1/assets?projectId=${projectId}&type=drawing&limit=500`),
      ])

      const docs = docsRes.ok ? (await docsRes.json()).assets || [] : []
      const drws = drwRes.ok ? (await drwRes.json()).assets || [] : []

      // Combine and ensure only document/drawing types are included
      const combined: AssetHead[] = [...docs, ...drws]
        .filter((a: AssetHead) => a.type === 'document' || a.type === 'drawing')
      setAssets(combined)
      if (!docsRes.ok || !drwRes.ok) {
        console.error('Failed to fetch some assets:', docsRes.statusText, drwRes.statusText)
      }
    } catch (err) {
      console.error('Error fetching assets:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const handleDownloadDocument = async (asset: AssetHead) => {
    try {
      const blobUrl = asset.metadata?.blob_url || asset.content?.source_blob_url || asset.content?.blob_url
      if (!blobUrl) {
        console.error('No blob URL available for download')
        return
      }

      // Extract blob path from URL
      const blobPathMatch = blobUrl.match(/\/documents\/(.+)$/)
      if (!blobPathMatch) {
        console.error('Could not extract blob path from URL')
        return
      }

      const blobPath = blobPathMatch[1]

      // Get SAS token for the blob
      const response = await fetch(`/api/v1/projects/${projectId}/azure-sas-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobPath })
      })

      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }

      const { downloadUrl } = await response.json()
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download document')
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const groupedByDocNumber = useMemo(() => {
    const groups: Record<string, AssetHead[]> = {}
    for (const a of assets) {
      const ur = a.metadata?.llm_outputs?.unified_register
      if (!ur) continue
      const key = `${ur.doc_kind}:${ur.document_number}`
      if (!groups[key]) groups[key] = []
      groups[key].push(a)
    }
    // Sort each group by created_at desc, then version desc for safety
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        const at = new Date(a.updated_at || a.created_at || 0).getTime()
        const bt = new Date(b.updated_at || b.created_at || 0).getTime()
        if (bt !== at) return bt - at
        return (b.version || 0) - (a.version || 0)
      })
    }
    return groups
  }, [assets])

  const rows = useMemo(() => {
    return Object.entries(groupedByDocNumber).map(([key, versions]) => {
      const latest = versions[0]
      const ur = latest.metadata?.llm_outputs?.unified_register
      const name = ur?.title || '-'
      const number = ur?.document_number || '-'
      const revision = ur?.revision_code || '-'
      const type = (ur?.doc_kind) as any
      const subtype = ur?.subtype
      const count = versions.length
      return { key, latest, versions, name, number, revision, type, subtype, count }
    })
  }, [groupedByDocNumber])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Document Register</h2>
        <div className="flex items-center gap-2">
          {uploadButton}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Revision</TableHead>
            <TableHead>Versions</TableHead>
            <TableHead>Discipline / Subtype</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ key, latest, versions, name, number, revision, type, subtype, count }) => {
            const isExpanded = !!expanded[key]
            const discipline = latest.metadata?.llm_outputs?.unified_register?.discipline
            return (
              <React.Fragment key={key}>
                <TableRow>
                    <TableCell className="capitalize">{type}</TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {revision}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpanded(prev => ({ ...prev, [key]: !isExpanded }))}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  <TableCell>
                    <Badge variant={count > 1 ? 'default' : 'outline'}>{count}</Badge>
                  </TableCell>
                  <TableCell>
                    {discipline ? `${discipline}${subtype ? ` • ${subtype}` : ''}` : (subtype || '-')}
                  </TableCell>
                  <TableCell>{new Date(latest.updated_at || latest.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Download"
                        onClick={() => handleDownloadDocument(latest)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {versions.length > 1 && (
                        <Button variant="outline" size="sm" title="Revision history">
                          <History className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow key={`${key}-expanded`}>
                    <TableCell colSpan={8}>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Revision history</div>
                        <div className="border rounded">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Version</TableHead>
                                <TableHead>Revision</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {versions.map(v => (
                                <TableRow key={v.id}>
                                  <TableCell>{v.version}</TableCell>
                                  <TableCell>{v.revision_code || '-'}</TableCell>
                                  <TableCell>{new Date(v.created_at).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      title="Download"
                                      onClick={() => handleDownloadDocument(v)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Subdocuments removed by design */}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
