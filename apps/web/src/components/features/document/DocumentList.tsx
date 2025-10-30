'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Download, Trash2, Eye, EyeOff } from 'lucide-react'

interface Document {
  id: string
  document_name: string
  file_name: string
  source_document_id?: string
  document_number?: string
  revision_code?: string
  extracted_content?: string
  blob_url?: string
  storage_path?: string
  metadata: any
  status: string
  created_at: string
  updated_at: string
  type: string
  processing_status: string
}

interface DocumentListProps {
  projectId: string
}

export default function DocumentList({ projectId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllRevisions, setShowAllRevisions] = useState(false)
  const [expandedDocumentNumbers, setExpandedDocumentNumbers] = useState<Set<string>>(new Set())

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/documents?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/v1/documents?id=${documentId}&projectId=${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchDocuments() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(`Failed to delete document: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const handleDownloadDocument = async (document: Document) => {
    if (document.blob_url) {
      window.open(document.blob_url, '_blank')
    } else {
      alert('Download URL not available')
    }
  }

  const toggleRevisionView = (documentNumber: string) => {
    const newExpanded = new Set(expandedDocumentNumbers)
    if (newExpanded.has(documentNumber)) {
      newExpanded.delete(documentNumber)
    } else {
      newExpanded.add(documentNumber)
    }
    setExpandedDocumentNumbers(newExpanded)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'text-green-600'
      case 'processing':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-6">Upload your first project document to get started.</p>
          <Button className="bg-primary hover:bg-primary/90">
            Upload Document
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Project Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Document Number</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.document_name || 'Processing...'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.file_name}
                    </TableCell>
                    <TableCell>
                      {doc.document_number ? (
                        <Badge variant="outline">{doc.document_number}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {doc.revision_code ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => doc.document_number && toggleRevisionView(doc.document_number)}
                        >
                          {doc.revision_code}
                          {doc.document_number && expandedDocumentNumbers.has(doc.document_number) ? (
                            <EyeOff className="ml-1 h-3 w-3" />
                          ) : (
                            <Eye className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={doc.processing_status === 'processed' ? 'default' : 'secondary'}
                        className={getStatusColor(doc.processing_status)}
                      >
                        {doc.processing_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(doc.updated_at || doc.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}