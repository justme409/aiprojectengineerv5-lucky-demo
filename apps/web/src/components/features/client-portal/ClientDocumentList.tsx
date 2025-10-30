"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye } from 'lucide-react'

interface ClientDocumentListProps {
  projectId: string
}

type Doc = { id: string, name: string, content_type?: string, size?: number, created_at: string, approval_state?: string, blob_url?: string }

export default function ClientDocumentList({ projectId }: ClientDocumentListProps) {
  const [documents, setDocuments] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/assets?projectId=${projectId}&type=document`)
      if (res.ok) {
        const json = await res.json()
        const docs: Doc[] = (json.assets || [])
          .filter((a: any) => (a.approval_state === 'approved'))
          .map((a: any) => ({
            id: a.id,
            name: a.name,
            content_type: a.content?.content_type || a.content?.mime_type,
            size: a.content?.size,
            created_at: a.created_at,
            approval_state: a.approval_state,
            blob_url: a.content?.blob_url || a.content?.document_url,
          }))
        setDocuments(docs)
      }
    } catch (e) {
      console.error('fetch docs error', e)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Documents</h1>
        <p className="text-muted-foreground mt-2">Access approved project documentation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Documents</CardTitle>
          <CardDescription>
            Documents approved for client access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-sm text-muted-foreground">No approved documents yet.</div>
            ) : documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(doc.content_type || 'DOC').toUpperCase()} • {doc.size ? `${(doc.size/1024/1024).toFixed(2)} MB` : ''} • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded bg-green-100 text-green-800`}>
                    Approved
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.blob_url || '#'} target={doc.blob_url ? '_blank' : undefined} rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.blob_url || '#'} download>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                    </a>
                  </Button>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
